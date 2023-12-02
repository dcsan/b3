import { AppConfig } from "../config/AppConfig.js"
import path from "path"
import fs from "fs"
import { PrismaClient } from "@prisma/client"
import { Clog } from "../utils/Clog.js"
import YAML from "yaml"

import type { StoryData, DocMeta, ChunkedDoc } from "../appTypes.js"
import { TranscriptParser } from "./TranscriptParser.js"
import { ImageGenerator } from "../services/ImageGenerator.js"

const prisma = new PrismaClient()
const clog = new Clog()

export class StoryMgr {
  // simple list just the metadata and a summary
  static async findList(): Promise<StoryData[]> {
    const story = await prisma.story.findMany({
      select: {
        id: true,
        cname: true,
        title: true,
      },
    })
    // clog.log("castList", castList)
    return story as StoryData[]
  }

  static async findByCname(cname: string) {
    const story = await prisma.story.findFirst({
      where: {
        cname,
      },
    })
    clog.log("story", story)
    return story
  }

  // find ONE with where clause
  static async findWhere(where: any): Promise<StoryData | null> {
    const story = await prisma.story.findFirst({
      where,
    })
    clog.log("story", story)
    return story as StoryData
  }

  // add in process transcription with asmId to fetch later
  static async logTranscript(obj: StoryData) {
    const story = await prisma.story.upsert({
      where: {
        cname: obj.cname!,
      },
      update: {
        asmId: obj.asmId,
        meta: obj.meta,
      },
      create: {
        cname: obj.cname,
        asmId: obj.asmId,
        meta: obj.meta,
      },
    })
    clog.log("story", story)
    return story
  }

  // docs are in the 'chunked' dir
  static getStoryPath(name: string, format?: "json" | "yaml"): string {
    const fpath = path.join(AppConfig.storyPath, `${name}.${format}`)
    return fpath
  }

  static loadMetaFile(cname: string): DocMeta {
    const metaPath = path.join(AppConfig.metaFilePath)
    const raw = fs.readFileSync(metaPath, "utf8")
    const meta = YAML.parse(raw)
    clog.log("meta", meta)
    const item = meta.find((item: any) => item.cname === cname)
    if (!item) throw new Error(`no metadata found for ${cname}`)
    return item
  }

  /**
   * load metadata into the db from the allMeta file
   * we also put duration and title into the root of DB structure
   * @param cname
   */
  static async addMeta(cname: string) {
    const meta = this.loadMetaFile(cname)
    const story = await prisma.story.upsert({
      where: {
        cname,
      },
      update: {
        meta,
        title: meta.title,
      },
      create: {
        cname,
        meta,
        title: meta.title,
      },
    })
    await this.addDuration(cname)
    // clog.log("story", story)
    return story
  }

  // called from the transcript parser
  static async addDuration(cname: string) {
    const scriptParser = new TranscriptParser()
    const duration = await scriptParser.getDuration(cname)
    const story = await prisma.story.upsert({
      where: {
        cname,
      },
      update: {
        duration,
      },
      create: {
        cname,
        duration,
      },
    })
    clog.log("story", story)
    return story
  }

  /**
   * load into the db from a docs/CNAME.json file
   * @param cname
   */
  static async loadDbFromFile(cname: string) {
    const doc = this.readJsonStory(cname)
    await prisma.story.upsert({
      where: {
        cname,
      },
      update: {
        title: doc.title,
        chapters: doc.chapters,
        chunks: doc.chunks,
        meta: doc.meta,
        entities: doc.entities,
      },
      create: {
        cname,
        title: doc.title,
        chapters: doc.chapters,
        chunks: doc.chunks,
        meta: doc.meta,
        entities: doc.entities,
      },
    })
    clog.log("loaded", doc.cname)
  }

  static readJsonStory(cname: string): ChunkedDoc {
    const fpath = this.getStoryPath(cname, "json")
    const raw = fs.readFileSync(fpath, "utf8")
    const blob = JSON.parse(raw) as ChunkedDoc
    return blob as ChunkedDoc
  }

  static async generateChapterImages(cname: string): Promise<string[]> {
    const doc = this.readJsonStory(cname)
    let images = []
    const outdir = path.join(AppConfig.rootPath, "renders", cname)
    fs.mkdirSync(outdir, { recursive: true })

    const generator = new ImageGenerator({
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1,
      prefix: "A technical illustration showing: ",
      suffix: " in the style of a futuristic and high-tech illustration.",
    })

    for (const chapter of doc.chapters) {
      const fpath = path.join(
        AppConfig.rootPath,
        "renders",
        cname,
        `${chapter.num}`
      )
      const text = chapter.summary
      const kw = chapter.keywords?.join(" ")
      await generator.generate(chapter.gist, fpath + "-gist.png")
      // for (const kw of chapter.keywords || []) {
      //   await generator.generate(kw, fpath + "-" + kw + ".png")
      // }
      // await generator.generate(chapter.summary, fpath + "-summary.png")
      // await generator.generate(chapter.headline, fpath + "-headline.png")
      // kw && (await generator.generate(kw, fpath + "-kw.png"))

      clog.log("image", fpath)
      images.push(fpath)
    }
    return images
  }

  static async redoAll() {
    const stories = await prisma.story.findMany()
    const scriptParser = new TranscriptParser()
    for (const story of stories) {
      await this.redoOne(story.cname!)
    }
  }

  static async redoOne(cname: string) {
    const scriptParser = new TranscriptParser()
    await scriptParser.cleanChunked(cname)
    await this.loadDbFromFile(cname)
    // await this.generateChapterImages(cname)
  }

  static async dump(cname: string) {
    const story = (await prisma.story.findFirst({
      where: {
        cname,
      },
    })) as StoryData // cast to StoryData cos prisma types are mostly not usable
    clog.log("story", story)
    if (!story) throw new Error(`no story found for ${cname}`)
    await this.writeStory(cname, story)
  }

  static async dumpAll() {
    const stories = await prisma.story.findMany()
    for (const story of stories) {
      await this.dump(story.cname!)
    }
  }

  static async writeStory(cname: string, story?: StoryData) {
    const dump = JSON.stringify(story, null, 2)
    const outJson = path.join(AppConfig.storyPath, cname + ".json")
    clog.log("Writing to: ", outJson)
    fs.writeFileSync(outJson, dump)
  }
}

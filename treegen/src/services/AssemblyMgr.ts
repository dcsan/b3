// npm install assemblyai
import fs from "fs"
import path from "path"
import { AssemblyAI } from "assemblyai"
import { TranscribeOpts } from "../config/serverTypes.js"
import { AppConfig } from "../config/AppConfig.js"
import { Clog } from "../utils/Clog.js"
import YAML from "yaml"
import { DocMeta, StoryData } from "../appTypes.js"
import { StoryMgr } from "../models/StoryMgr.js"

const clog = new Clog()

class AssemblyMgr {
  client: AssemblyAI

  constructor() {
    this.client = new AssemblyAI({
      apiKey: AppConfig.ASSEMBLY_API_KEY,
    })
  }

  async transStart(cname: string) {
    const meta = StoryMgr.loadMetaFile(cname)
    const audioUrl = meta.audioUrl

    const config = {
      audio_url: audioUrl,
      speaker_labels: true,
      auto_highlights: true,
      auto_chapters: true,
      iab_categories: true,
      entity_detection: false,

      // can only summarize or chapters, not both
      // summarization: true,
      // summary_model: "informative",
      // summary_type: "bullets",
    }
    // dont poll to just start and get an ID
    const options = {
      // pollingTimeout: 10000,
      poll: false,
    }
    const transcript = await this.client.transcripts.create(config, options)
    clog.log("trans", transcript)

    const obj: StoryData = {
      cname: cname,
      asmId: transcript.id,
      meta: meta,
    }

    await StoryMgr.logTranscript(obj)

    return transcript
  }

  async transList() {
    const items = await this.client.transcripts.list()
    clog.log("items", items)
    return items.transcripts
  }

  // async fetchAll() {
  //   const items = await this.transList()
  //   for (let item of items) {
  //     const done = await this.transFetch({
  //       id: item.id,
  //       output: `${item.id}.json`,
  //     })
  //     clog.log("done", done)
  //   }
  //   return items
  // }

  /**
   * fetch from AsmAI based on cname
   * assumes the transcript was started and logged in our DB
   * @param cname
   * @returns
   */
  async transFetch(cname: string) {
    const story = await StoryMgr.findByCname(cname)
    const asmId = story?.asmId
    if (!asmId) throw new Error(`no asmId for ${cname}`)
    const transcript = await this.client.transcripts.get(asmId)

    if (transcript.status !== "completed") {
      clog.log("not ready:", {
        cname,
        id: transcript.id,
        status: transcript.status,
      })
      return false
      // throw new Error(`transcript not complete for ${cname}`)
    }
    const fp = path.join(AppConfig.dataPath, "transcripts", `${cname}.json`)
    fs.writeFileSync(fp, JSON.stringify(transcript, null, 2))
    return true
  }

  async transFetchWait(cname: string, maxMins = 30) {
    for (let i = 0; i < maxMins; i++) {
      const result = await this.transFetch(cname)
      if (result) break
      clog.log("waiting...", i)
      await new Promise((r) => setTimeout(r, 1000 * 60))
    }
  }
}

export const assemblyMgr = new AssemblyMgr()

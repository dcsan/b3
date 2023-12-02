import path from "path"
import { Clog } from "../utils/Clog.js"
import fs from "fs"
import { AppConfig } from "../config/AppConfig.js"
import { NatLang } from "./NatLang.js"
import { basicReplace, cleanText, splitList } from "../utils/TextUtils.js"
import type {
  ChunkedDoc,
  AsmChapter,
  AsmTranscript,
  Chunk,
} from "../appTypes.js"

const clog = new Clog()

export class TranscriptParser {
  // nlpLib: NlpLib
  natLang: NatLang

  constructor() {
    // this.nlpLib = new NlpLib()
    this.natLang = new NatLang()
  }

  readChunked(cname: string): ChunkedDoc {
    const fp = path.join(AppConfig.storyPath, cname + ".json")
    clog.log("Reading from: ", fp)
    const text = fs.readFileSync(fp, "utf8")
    const story = JSON.parse(text) as ChunkedDoc
    return story
  }

  /**
   * go through and clean up without querying openAI for everything again
   * do basic replace for spelling
   * mostly used while improving basic scripts but to save a bit of API calls
   * @param opts
   */
  async cleanChunked(cname: string) {
    const story = this.readChunked(cname)
    const { chunks } = story

    for (let chunk of chunks) {
      let { text } = chunk
      text = basicReplace(text)
      if (text?.length < 100) {
        chunk.keywords = []
        chunk.summary = ""
        chunk.nouns = []
        chunk.longWords = []
      } else {
        chunk.text = text
        if (chunk.longWords) {
          chunk.longWords = splitList(chunk.longWords?.join(", "))
        }
        if (chunk.keywords) {
          // resplit and clean up
          chunk.keywords = splitList(chunk.keywords?.join(", "))
        }
        if (chunk.keywords?.join(" ").match(/preamble|punctuation/i)) {
          const features = await this.natLang.getFeatures(text)
          clog.warn("redo keywords", {
            text,
            before: chunk.keywords,
            after: features?.keywords || "none",
          })
          if (features?.keywords) {
            chunk.keywords = features?.keywords
          }
        }
      }
    }
    story.chunks = chunks
    story.chapters = await this.buffChapters(story)
    // overwrite it
    this.writeScript(cname, story)
  }

  writeScript(cname: string, final: ChunkedDoc) {
    const dump = JSON.stringify(final, null, 2)
    const outPath = path.join(AppConfig.storyPath, cname + ".json")
    clog.log("Writing to: ", outPath)
    fs.writeFileSync(outPath, dump)
  }

  // add keywords, nouns, and basicReplace
  async buffChapters(cdoc: ChunkedDoc): Promise<AsmChapter[]> {
    const chapters = cdoc.chapters
    const after: AsmChapter[] = []
    let num = 0
    for (let chap of chapters) {
      let { gist, headline, summary } = chap
      summary = basicReplace(summary!)
      const keywords =
        chap.keywords || (await this.natLang.getKeywords(summary))

      const lines = this.findLines(cdoc, chap)
      const topics =
        chap.topics || (await this.natLang.getKeywords(lines.join(" ")))
      const quote =
        cleanText(chap.quote) || (await this.natLang.getQuote(lines)) || ""

      const clean: AsmChapter = {
        ...chap,
        num: num++,
        keywords,
        summary,
        lines,
        quote,
        topics,
        gist: basicReplace(gist),
        headline: basicReplace(headline),
      }
      after.push(clean)
    }
    return after
  }

  // find the internal content for a chapter
  findLines(cdoc: ChunkedDoc, chapter: AsmChapter): string[] {
    const { start, end } = chapter
    const utts = cdoc.chunks.filter((chunk) => {
      return chunk.start >= start && chunk.end <= end
    })
    const lines = utts.map((line) => {
      return line.text
    })
    return lines
  }

  async getDuration(cname: string): Promise<number> {
    const raw = await this.readTranscriptFile(cname)
    const duration = raw.audio_duration
    return duration
  }

  async readTranscriptFile(cname: string): Promise<AsmTranscript> {
    const inPath = path.join(
      AppConfig.rootPath,
      "data/transcripts",
      cname + ".json"
    )

    clog.log("Parsing file: ", inPath)
    const raw = fs.readFileSync(inPath, "utf8")
    const rawScript = JSON.parse(raw) as AsmTranscript
    return rawScript
  }

  /**
   * strip out words
   * chunk paragraphs by speaker turn
   * then add keywords, concepts, nouns with chatGPT
   * @param opts
   */
  async chunkScript(cname: string, sample = false) {
    const rawScript = await this.readTranscriptFile(cname)
    const chunks = []
    const utterances = sample
      ? rawScript.utterances.slice(50, 60)
      : rawScript.utterances

    for (let utt of utterances) {
      // const alt = item.alternatives[0]
      // const word = alt.words[0]
      // const start = parseInt(word.startTime.seconds || 0) // + word.startTime.nanos || 0 / 1e9
      let text = utt.text
      text = basicReplace(text)
      const features = await this.natLang.getFeatures(text)
      // const terms = this.nlpLib.findTerms(text)
      // const nounsPos = await this.nlpLib.getNouns(text)

      const chunk: Chunk = {
        text,
        start: utt.start,
        end: utt.end,
        duration: utt.end - utt.start,
        speaker: utt.speaker,
        keywords: features?.keywords,
        summary: features?.summary,
        nouns: features?.nouns,
        longWords: features?.longWords,
        // nounsPos,
        // terms,
        // end
      }
      chunks.push(chunk)
    }

    // const lines = raw.split("\n")
    // clog.log("Lines: ", lines.length)

    const final: ChunkedDoc = {
      cname,
      id: rawScript.id,
      duration: rawScript.audio_duration,
      chapters: rawScript.chapters,
      chunks,
      entities: rawScript.entities,
    }

    // add keywords, lines etc
    final.chapters = await this.buffChapters(final)

    this.writeScript(cname, final)
    return final
  }
}

import { OpenAI } from "langchain/llms/openai"
import { AppConfig } from "../config/AppConfig.js"
import { simpleQuery } from "../services/OpenAiSvc.js"
import { splitList } from "../utils/TextUtils.js"
import { Clog } from "../utils/Clog.js"

const clog = new Clog()

export type Features = {
  keywords?: string[]
  summary?: string
  nouns?: string[]
  longWords?: string[]
}

export class NatLang {
  // constructor() {
  //   const openai = new OpenAI(AppConfig.OPENAI_API_KEY)
  // }

  async getKeywords(text: string): Promise<string[] | undefined> {
    if (!text || text.length < 100) return

    const kwPrompt = `On one line with no extra punctuation or numbers, separated by commas without any preamble or extra words,
    tell me up to five keywords that summarize the following text:
    ${text}\n`
    let kwText = await simpleQuery(kwPrompt)
    if (kwText?.match(/punctuation/i)) {
      // try again
      clog.warn("failed to get keywords, trying again", { kwText })
      kwText = await simpleQuery(kwPrompt)
      clog.warn("try 2 got =>", { kwText })
    }

    kwText = kwText?.replace(/keywords/im, "")
    const keywords = splitList(kwText)

    return keywords
  }

  async getFeatures(text?: string): Promise<Features | undefined> {
    if (!text || !text.length) return
    if (text.length < 100) return // skip for very short texts

    const summaryPrompt = `Write a short one sentence summary in casual english of the following text:
      ${text}\n`

    const longWordsPrompt = `Find the top five longest most complex or rarest words and return the words as a comma separated list from the following text:
    ${text}`

    const nounsPrompt = `extract five nouns or or objects separated by commas without any extra words or numbers from this text:
    ${text}\n`

    let summary = await simpleQuery(summaryPrompt)
    summary = summary?.replace(/summary/i, "")

    let nounsText = await simpleQuery(nounsPrompt)
    nounsText = nounsText?.replace(/nouns/i, "")
    const nouns = splitList(nounsText)

    let longWordsText = await simpleQuery(longWordsPrompt)
    // nounsText = nounsText.replace(/nouns/i, "")
    const longWords = splitList(longWordsText)

    const keywords = await this.getKeywords(text)

    return { keywords, summary, nouns, longWords }
  }

  async getQuote(lines: string[]) {
    const quotePrompt = `Find the most representative short line from the following lines of text:
    ${lines.join("\n")}\n`
    const quote = await simpleQuery(quotePrompt)
    return quote
  }
}

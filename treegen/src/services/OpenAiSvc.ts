import { OpenAI } from "langchain/llms/openai"
import { AppConfig } from "../config/AppConfig.js"
import { PromptTemplate } from "langchain/prompts"
import { Clog } from "../utils/Clog.js"
import { cleanText } from "../utils/TextUtils.js"
import { safeName } from "../utils/dirpath.js"

const clog = new Clog()

export type OpenAiQueryOptions = {
  topicName: string
  nodeName?: string
  promptTemplate: PromptTemplate
  text?: string
  count?: "one" | "two" | "three" | "four" | "five" | "six" | "seven" | "eight"
  format?: "list" | "short" | "medium" | "long"
}

const model = new OpenAI({
  openAIApiKey: AppConfig.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo-instruct",
  // model: "davinci",
})

function splitItems(input: string): string[] {
  clog.log("split in=>", input)
  let lines = input.split("\n")
  lines = lines.map(safeName)
  lines = lines.filter((line) => line.length > 0)
  clog.log("split out=>", lines)
  return lines
}

function logQuery(query: OpenAiQueryOptions, result: any) {
  console.log("logQuery", {
    topicName: query.topicName,
    nodeName: query.nodeName,
    result,
  })
}

export async function simpleQuery(text: string) {
  const res = await model.call(text)
  const clean = cleanText(res)
  clog.log("simpleQuery", { text, clean })
  return clean
}

/**
 * returns a block of text
 * @param query
 * @returns
 */
export const textQuery = async (query: OpenAiQueryOptions): Promise<string> => {
  const chain = query.promptTemplate.pipe(model)
  let result = await chain.invoke({
    topicName: query.topicName,
    nodeName: query.nodeName,
    text: query.text,
    count: query.count || "three",
  })
  // logQuery(query, result)
  return result.trim()
}

/**
 * returns list items
 * @param query
 * @returns
 */
export const listQuery = async (
  query: OpenAiQueryOptions
): Promise<string[]> => {
  const result = await textQuery(query)
  const lines = splitItems(result)
  logQuery(query, lines)
  return lines
}

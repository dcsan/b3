import { PromptTemplate } from "langchain/prompts"

const formatList = `Keep each item to one to three words maximum. Return a list of up to {count} items one word per line. Do not add any extra punctuation or numbers.`
const shortText = `Limit your response to 1 to 2 sentences.`
const mediumText = `Provide an answer of 1 or two paragraphs.`
const longText = `Provide a detailed answer of 3 to 5 paragraphs.`

const formats = {
  list: formatList,
  short: shortText,
  medium: shortText,
  long: longText,
}

type FormatType = keyof typeof formats

const templates = {
  // normally list replies
  concepts: `What are {count} major concepts of {topicName}? `,
  expand: `In the context of {topicName}, tell me {count} other related {nodeName}s?  `,
  people: `What are the names of {count}  people related to {topicName}? `,
  events: `What are the names of {count}  major events related to {topicName}? `,
  related: `Regarding {topicName} what are {count}  concepts related to {nodeName}? `,
  history: `What are some key points in the history of {topicName} ?`,
  categories: `What are {count} categories that {topicName} falls into? `,
  questions: `What are {count} questions that are asked about {topicName}? `,

  // normally text blocks
  overview: `Give me an overview of {topicName}? `,
  detail: `In the context of {topicName}, tell me more about {nodeName}. `,
  intro: `Give me a brief introduction to {topicName}. `,
  // category: `Is {topicName} a person, place, event, idea or something else?`,

  freechat: `In the context of {topicName} and {nodeName}, {text}? `,
}

export type TemplateName = keyof typeof templates

export type TemplateOpts = {
  templateName?: TemplateName
  fallback?: TemplateName
  format?: "list" | "short" | "medium" | "long"
  count?: "one" | "two" | "three" | "four" | "five" | "six" | "seven" | "eight"
  tags?: boolean
}

export function getTemplate(opts: TemplateOpts): PromptTemplate {
  let templateData =
    templates[opts.templateName!] || (opts.fallback && templates[opts.fallback])

  let format = opts.format || ("list" as FormatType)
  templateData += formats[format]

  if (!templateData) {
    throw new Error(`No template found for ${name}`)
  }
  const promptTemplate = PromptTemplate.fromTemplate(templateData)
  return promptTemplate
}

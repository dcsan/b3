// shared with client

// import { JsonValue } from "@prisma/client/runtime/library"
// import { TranscriptUtterance } from "assemblyai/dist/types"
// import { JsonValue } from "@prisma/client/runtime/library"
import { ElementDefinition } from "cytoscape"

// declare core PrismaTypes
export declare interface JsonArray extends Array<JsonValue> {}
export declare type JsonObject = {
  [Key in string]?: JsonValue
}

export declare type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray

export type NodeChatRequest = {
  topicName: string
  nodeName: string
  text?: string
}

// generator options
export type GenerateOptions = {
  useCache?: boolean
  text?: boolean
  depth?: number

  branchesPerNode?:
    | "one"
    | "two"
    | "three"
    | "four"
    | "five"
    | "six"
    | "seven"
    | "eight"
}

export type TopicGraph = {
  name: string
  type?: string // person/event/concept
  overview?: string
  elements: ElementDefinition[]
}

export type DetailTopicResult = {
  topicName: string
  nodeName: string
  content: string
}

export enum ChatRole {
  user = "user",
  bot = "bot",
}

export type ChatMessage = {
  role: ChatRole
  text: string
  links?: string[]
  meta?: {
    topicName: string
    nodeName: string
  }
}

// export type TopicNode = {
//   id: string;
//   name?: string;
//   val?: number;
// };

// export type TopicLink = {
//   source: string;
//   target: string;
// };

// export type TopicData = {
//   name: string;
//   nodes?: TopicNode[];
//   links?: TopicLink[];
// };

// export type TopicGraph = TopicData[];

// export type TopicDataResponse = {
//   topic: TopicData;
// };

export type AsmWord = {
  text: string
  start: number
  end: number
  confidence: number
  speaker: "A" | "B"
}

// we add keywords to AAI chapter
export type AsmChapter = {
  /** @description The starting time, in milliseconds, for the chapter */
  end: number
  /** @description An ultra-short summary (just a few words) of the content spoken in the chapter */
  gist: string
  /** @description A single sentence summary of the content spoken during the chapter */
  headline: string
  /** @description The starting time, in milliseconds, for the chapter */
  start: number
  /** @description A one paragraph summary of the content spoken during the chapter */

  // added by us
  summary?: string
  topics?: string[]
  keywords?: string[]
  lines?: string[]
  num?: number // index
  quote: string
}

// they left off the speaker field in types?
export type AsmUtterance = {
  speaker: "A" | "B"
  channel: string
  /** Format: double */
  confidence: number
  end: number
  start: number
  text: string
  words: AsmWord[]
}

export type AsmHighlights = {
  status: "success" | string
  results: {
    count: number
    rank: number
    text: string
  }[]
}

export type AsmEntity = {
  entity_type:
    | "person_name"
    | "person_age"
    | "url"
    | "occupation"
    | "location"
    | "political_affiliation"
    | "medical_condition"
    | "money_amount"
    | "organization"
    | string
  text: string
  start: number
  end: number
}

export type AsmTranscript = {
  id: string
  audio_duration: number
  confidence: number
  language_model: "assemblyai_default"
  acoustic_model: "assemblyai_default"
  language_code: "en_us"
  status: "completed"
  audio_url: string
  text: string

  words: AsmWord[]
  chapters: AsmChapter[]
  utterances: AsmUtterance[]
  auto_highlights_result: AsmHighlights
  entities: AsmEntity[] // not very useful
}

// single speaker chunk
export type Chunk = {
  text: string
  start: number
  end: number
  duration: number
  speaker: "A" | "B"
  keywords?: string[]
  summary?: string
  nouns?: string[]
  longWords?: string[]
}

// metadata on a podcast or document
export type DocMeta = {
  title?: string
  episode?: number
  season?: number
  guests?: string[]
  hosts?: string[]
  createdAt?: Date
  audioUrl?: string
}

// // chunked doc filetype on disc
export type ChunkedDoc = {
  id: string
  cname: string
  title?: string
  meta?: DocMeta
  chunks: Chunk[]
  duration: number
  chapters: AsmChapter[]
  entities: AsmEntity[]
}

// DB record that contains the doc
// have to type the JSON fields as 'any' so this is a bit pointless
export type StoryData = {
  cname: string | null
  id?: string
  title?: string | null
  asmId?: string | null
  duration?: number | null

  // chunked doc
  meta?: DocMeta | any
  chapters?: AsmChapter[]
  chunks?: Chunk[]
  entities?: AsmEntity[]

  // auto-generated
  createdAt?: Date
  updatedAt?: Date
}

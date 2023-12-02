import fs from "fs"
import _ from "lodash"
import path, { dirname } from "path"
import yaml from "js-yaml"

import { GenerateOptions, TopicGraph } from "../appTypes.js"
import { listQuery, textQuery } from "../services/OpenAiSvc.js"
import { TemplateName, getTemplate } from "../topics/getTemplate.js"
import { ElementDefinition } from "cytoscape"
import { Clog } from "../utils/Clog.js"
import { safeName } from "../utils/dirpath.js"
import { AppConfig } from "../config/AppConfig.js"
import { optionalNodes } from "../utils/PromptData.js"
import { Topic } from "./Topic.js"

const clog = new Clog()

const ITEM_COUNT = 0

// retrieve text for each node in advance
const config = {
  text: false,
}

const defaultOptions: GenerateOptions = {
  useCache: false,
  depth: 1,
}

class TopicBuilder {
  topicName: string
  topic: Topic
  requiredNodes = ["concepts", "overview", "categories"]
  nodes: ElementDefinition[] = []
  // maxLevels = 1 // default
  options?: GenerateOptions

  constructor(topicName: string, opts?: GenerateOptions) {
    this.topicName = topicName
    this.topic = new Topic({ useCache: false })
    this.options = { ...defaultOptions, ...opts }
  }

  async buildTopic(topicName: string) {
    const rootNode = {
      data: {
        id: topicName,
        color: "#FF0088",
        type: "node",
        meta: { root: true },
      },
    }

    this.nodes.push(rootNode)
    await this.buildGraph()

    const topicGraph: TopicGraph = {
      name: topicName,
      overview: await this.getOverview(),
      elements: this.nodes,
    }
    // Topic.writeTopic(topicGraph, "json")
    this.topic.writeTopic(topicGraph, "yaml")
    return topicGraph
  }

  async getOverview() {
    const text = await textQuery({
      topicName: this.topicName,
      nodeName: "overview",
      promptTemplate: getTemplate({
        name: "overview" as TemplateName,
        fallback: "detail",
        format: "long",
      }),
    })
    return text
  }

  async buildGraph() {
    const rootNames = ["concepts"]
    // let elems: ElementDefinition[] = []
    for (let subTopic of rootNames) {
      await this.recurseNodes(this.topicName, subTopic)
    }
  }

  async recurseNodes(parent: string, topicName: string, level = 0) {
    if (level > (this.options?.depth || 1)) return

    const subTopicNames = await listQuery({
      topicName: parent,
      nodeName: topicName,
      count: "three",
      promptTemplate: getTemplate({
        name: parent as TemplateName,
        fallback: "expand",
        format: "list",
      }),
    })

    for (let subTopicName of subTopicNames) {
      const topic = await this.makeNode(topicName, subTopicName)
      const link = await this.makeLink(parent, subTopicName)
      if (topic && link) {
        this.nodes.push(topic)
        this.nodes.push(link)
        await this.recurseNodes(subTopicName, topicName, level + 1)
      }
    }
  }

  /**
   * get a nodes content
   * topicName is used for context
   * @param topicName
   * @param nodeName
   */
  async makeNode(topicName: string, nodeName: string) {
    if (this.nodes.find((n) => n.data.id === nodeName)) {
      // skip
      return
    }

    const text = config.text
      ? await textQuery({
          topicName,
          nodeName,
          promptTemplate: getTemplate({
            name: nodeName as TemplateName,
            fallback: "detail",
            format: "short",
          }),
        })
      : "text"

    return {
      data: {
        id: nodeName,
        text,
        type: "node",
      },
    }
  }

  /**
   * get a nodes content
   * @param topicName
   * @param nodeName
   */
  async makeLink(source: string, target: string) {
    const exists = this.nodes.find(
      (n) => n.data.source === source && n.data.target === target
    )
    if (exists) return

    return {
      data: {
        source,
        target,
        type: "link",
      },
    }
  }

  // async addBaseNodes(topicName: string): Promise<ElementDefinition[]> {
  //   let optIdeas = _.sampleSize(optionalNodes, ITEM_COUNT)
  //   const allNodeNames = [...this.requiredNodes, ...optIdeas]

  //   let elems: ElementDefinition[] = []
  //   for (let item of this.requiredNodes) {
  //     const itemNodes = await this.addDeepLinks({
  //       topicName,
  //       nodeName: item,
  //       count: "three",
  //       direct: true,
  //     })
  //     elems.push(...itemNodes)
  //   }

  //   for (let nodeName of allNodeNames) {
  //     const conceptLinks = await this.addDeepLinks({
  //       topicName,
  //       nodeName,
  //       direct: false,
  //     })
  //     elems.push(...conceptLinks)
  //   }
  //   return elems
  // }

  // async addDeepLinks(props: {
  //   topicName: string
  //   nodeName: string
  //   direct: boolean
  //   count?:
  //     | "one"
  //     | "two"
  //     | "three"
  //     | "four"
  //     | "five"
  //     | "six"
  //     | "seven"
  //     | "eight"
  // }) {
  //   const { topicName, nodeName, direct, count } = props

  //   const subTopics = await listQuery({
  //     topicName,
  //     nodeName,
  //     count: count || "three",
  //     promptTemplate: getTemplate({
  //       name: nodeName as TemplateName,
  //       fallback: "expand",
  //       format: "list",
  //     }),
  //   })

  //   let elems: ElementDefinition[] = []

  //   // add the middle node
  //   if (!direct) {
  //     elems.push(await this.makeNode(topicName, nodeName))
  //     elems.push(await this.makeLink(topicName, nodeName))
  //     // elems.push({ data: { id: nodeName } }) // node
  //     // elems.push({ data: { source: topicName, target: nodeName } }) // link
  //   }

  //   for (let subTopic of subTopics) {
  //     // { data: { id: subTopic } }
  //     elems.push(await this.makeNode(topicName, subTopic)) // node
  //     if (direct) {
  //       elems.push(await this.makeLink(topicName, subTopic))
  //       // elems.push({ data: { source: topicName, target: subTopic } }) // link
  //     } else {
  //       elems.push(await this.makeLink(nodeName, subTopic))
  //       // elems.push({ data: { source: nodeName, target: subTopic } })
  //     }
  //   }

  //   return elems
  // }

  // dedupe(elems: ElementDefinition[]) {
  //   const deduped = _.uniqWith(elems, _.isEqual)
  //   return deduped
  // }
}

// const topicBuilder = new TopicBuilder()
export { TopicBuilder }

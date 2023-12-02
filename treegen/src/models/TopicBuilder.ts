import { GenerateOptions, TopicGraph } from "../appTypes.js"
import { listQuery, textQuery } from "../services/OpenAiSvc.js"
import { TemplateName, getTemplate } from "../topics/getTemplate.js"
import { ElementDefinition } from "cytoscape"
import { Topic } from "./Topic.js"
import { Clog } from "../utils/Clog.js"

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
  baseTopicName: string
  topic: Topic
  requiredNodes = ["concepts", "overview", "categories"]
  nodes: ElementDefinition[] = []
  // maxLevels = 1 // default
  options?: GenerateOptions

  constructor(topicName: string, opts?: GenerateOptions) {
    this.baseTopicName = topicName
    this.topic = new Topic(topicName, { useCache: false })
    this.options = { ...defaultOptions, ...opts }
  }

  async buildTopic() {
    const rootNode = {
      data: {
        id: this.baseTopicName,
        color: "#FF0088",
        type: "node",
        meta: { root: true },
      },
    }

    this.nodes.push(rootNode)
    await this.buildGraph()

    const topicGraph: TopicGraph = {
      name: this.baseTopicName,
      overview: await this.getOverview(),
      elements: this.nodes,
    }
    // Topic.writeTopic(topicGraph, "json")
    this.topic.writeGraph(topicGraph, "yaml")
    return topicGraph
  }

  async getOverview() {
    const text = await textQuery({
      topicName: this.baseTopicName,
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
      await this.recurseNodes(subTopic)
    }
  }

  async recurseNodes(branchTopic: string, level = 0) {
    if (level > (this.options?.depth || 1)) return

    const subTopicNames = await listQuery({
      topicName: this.baseTopicName,
      nodeName: branchTopic,
      count: this.options?.branchesPerNode || "one",
      promptTemplate: getTemplate({
        name: branchTopic as TemplateName,
        fallback: "expand",
        format: "list",
      }),
    })

    for (let subTopicName of subTopicNames) {
      const topic = await this.makeNode(branchTopic, subTopicName)
      const link = await this.makeLink(branchTopic, subTopicName)
      if (topic && link) {
        this.nodes.push(topic)
        this.nodes.push(link)
        await this.recurseNodes(subTopicName, level + 1)
      }
    }
  }

  /**
   * get a nodes content
   * topicName is used for context
   * TODO fuzzy matching on existing nodes
   * @param topicName
   * @param nodeName
   */
  async makeNode(topicName: string, nodeName: string) {
    if (this.nodes.find((n) => n.data.id === nodeName)) {
      return // already exists so skip it
    }

    const text = this.options?.text
      ? await textQuery({
          topicName,
          nodeName,
          promptTemplate: getTemplate({
            name: nodeName as TemplateName,
            fallback: "detail",
            format: "short",
          }),
        })
      : ""

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
}

export { TopicBuilder }

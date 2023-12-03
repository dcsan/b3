import { GenerateOptions, TopicGraph } from "../appTypes.js"
import { listQuery, textQuery } from "../services/OpenAiSvc.js"
import { TemplateName, getTemplate } from "../topics/getTemplate.js"
import { ElementDefinition } from "cytoscape"
import { Topic } from "./Topic.js"
import { Clog } from "../utils/Clog.js"
import { safeName } from "../utils/dirpath.js"

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
        text: await this.getOverview(),
      },
    }

    this.nodes.push(rootNode)
    await this.buildGraph()

    const topicGraph: TopicGraph = {
      name: this.baseTopicName,
      elements: this.nodes,
    }
    this.topic.writeGraph(topicGraph)
    return topicGraph
  }

  async getOverview() {
    const text = await textQuery({
      topicName: this.baseTopicName,
      nodeName: "overview",
      promptTemplate: getTemplate({
        templateName: "overview" as TemplateName,
        fallback: "detail",
        format: "long",
      }),
    })
    return text
  }

  async buildGraph() {
    const templates = ["concepts", "people", "events", "related"]
    // let elems: ElementDefinition[] = []
    for (let template of templates) {
      await this.recurseNodes(template)
    }
  }

  async recurseNodes(template: string, level = 0) {
    if (level > (this.options?.depth || 1)) return

    const node = await this.makeNode(this.baseTopicName, template)
    node && this.nodes.push(node)

    const subTopicNames = await listQuery({
      topicName: this.baseTopicName,
      nodeName: template,
      count: this.options?.breadth || "one",
      promptTemplate: getTemplate({
        templateName: template as TemplateName,
        fallback: "expand",
        format: "list",
      }),
    })

    for (let subTopicName of subTopicNames) {
      const topic = await this.makeNode(template, subTopicName)
      const link = await this.makeLink(template, subTopicName)
      if (topic && link) {
        this.nodes.push(topic)
        this.nodes.push(link)
        await this.recurseNodes(subTopicName, level + 1)
      }
    }
  }

  /**
   * get a nodes content
   * nodeName = specific node/subtopic related to the topic
   * topicName is used for context
   * we try to find a template for the nodeName eg 'people' or 'events'
   * TODO fuzzy matching on existing nodes
   * @param topicName
   * @param nodeName
   */
  async makeNode(
    topicName: string,
    nodeName: string
  ): Promise<ElementDefinition | undefined> {
    if (this.nodes.find((n) => n.data.id === nodeName)) {
      return // already exists so skip it
    }

    nodeName = safeName(nodeName)

    const text = this.options?.text
      ? await textQuery({
          nodeName, // this node
          topicName, // context / topic overview parent
          promptTemplate: getTemplate({
            templateName: nodeName as TemplateName,
            fallback: "detail",
            format: "short",
          }),
        })
      : ""

    // if (this.options?.tags) {
    //   const tags = await listQuery({
    //     nodeName,
    //     topicName,
    //     count: "three",
    //     promptTemplate: getTemplate({
    //       templateName: "tags",
    //       fallback: "tags",
    //       format: "list",
    //     }),
    //   })
    // }

    return {
      data: {
        id: nodeName,
        type: "node",
        text,
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

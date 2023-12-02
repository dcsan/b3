import path, { dirname } from "path"
import { TopicGraph } from "../appTypes.js"
import { Clog } from "../utils/Clog.js"
import { Topic } from "./Topic.js"
import { AppConfig } from "../config/AppConfig.js"
import { mkdirSync } from "fs"
import { ElementDefinition } from "cytoscape"
import fs from "fs"

const clog = new Clog()

class VaultMaker {
  topicName: string
  graph?: TopicGraph

  constructor(topicName: string) {
    this.topicName = topicName
  }

  async make() {
    clog.log("make", this.topicName)
    const topic = new Topic({ useCache: false })
    this.graph = await topic.genGraph(this.topicName)
    // clog.log("topicData", graph)
    await this.writeVault(this.graph)
  }

  async writeVault(graph: TopicGraph) {
    clog.log("makeVault", graph)
    await this.makeIndex(graph)
    for (const elem of graph.elements) {
      // clog.log("elem", elem)
      await this.writeDoc(elem)
    }
  }

  async makeIndex(graph: TopicGraph) {
    const nodes = await this.getNodes(graph)
    const items = nodes.map((node) => node.data.id)
    const fpath = this.getPath("index", "md")
    const lines = items.map((item) => `- [[${item}]]`)
    let doc = `## nodes\n`
    doc += lines.join("\n")
    fs.writeFileSync(fpath, doc)
  }

  async getNodes(graph: TopicGraph) {
    const nodes = graph.elements.filter((elem) => elem.data.type === "node")
    return nodes
  }

  async getLinks(elem: ElementDefinition) {
    const targetId = elem.data.id
    const links = this.graph?.elements.filter((elem) => {
      if (elem.data.type === "link") {
        if (elem.data.source === targetId) return true
        // if (elem.data.target === targetId) return true
      }
      return false
    })
    return links
  }

  getPath(name: string, format?: "md" | "json" | "yaml"): string {
    const fpath = path.join(
      AppConfig.rootPath,
      `../vault/${this.topicName}/${name}.${format}`
    )
    mkdirSync(dirname(fpath), { recursive: true })
    return fpath
  }

  async writeDoc(elem: ElementDefinition) {
    const nodeId = elem.data.id
    if (!nodeId) return
    const fpath = this.getPath(nodeId, "md")
    let doc = await `## ${nodeId}`
    const links = await this.getLinks(elem)
    links?.forEach((link) => {
      doc += `\n- [[${link.data.target}]]`
    })
    fs.writeFileSync(fpath, doc, "utf8")
  }
}

export { VaultMaker }

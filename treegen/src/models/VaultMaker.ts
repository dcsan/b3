import path, { dirname } from "path"
import { GenerateOptions, TopicGraph } from "../appTypes.js"
import { Clog } from "../utils/Clog.js"
import { Topic } from "./Topic.js"
import { AppConfig } from "../config/AppConfig.js"
import { mkdirSync } from "fs"
import { ElementDefinition } from "cytoscape"
import fs from "fs"
import { genOptions } from "../config/genConfig.js"

const clog = new Clog()

class VaultMaker {
  topicName: string
  graph?: TopicGraph

  constructor(topicName: string) {
    this.topicName = topicName
  }

  async make() {
    clog.log("make", this.topicName)
    const topic = new Topic(this.topicName, genOptions)
    this.graph = await topic.genGraph()
    // clog.log("topicData", graph)
    await this.writeVault(this.graph)
  }

  async writeVault(graph: TopicGraph) {
    clog.log("makeVault", graph)
    await this.makeIndex(graph)
    for (const elem of graph.elements) {
      // clog.log("elem", elem)
      await this.writeMdDocs(elem)
    }
  }

  async makeIndex(graph: TopicGraph) {
    const nodes = await this.getNodes(graph)
    const items = nodes.map((node) => node.data.id)
    const indexName = `_${this.topicName}`
    const fpath = this.getPath(indexName, "md")
    const lines = items.map((item) => `- [[${item}]]`)
    let doc = `## ${this.topicName} \n\n`
    doc += `index \n\n`
    doc += lines.join("\n")
    fs.writeFileSync(fpath, doc)
    clog.log("wrote index to", fpath)
  }

  async makeIframe(graph: TopicGraph) {
    const fpath = this.getPath("iframe", "html")
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
      `../../b3vault/${this.topicName}/${name}.${format}`
    )
    mkdirSync(dirname(fpath), { recursive: true })
    return fpath
  }

  async writeMdDocs(elem: ElementDefinition) {
    const nodeId = elem.data.id
    if (!nodeId) return
    const fpath = this.getPath(nodeId, "md")
    let doc = await `## ${nodeId}\n${elem.data.text}\n\n`
    const links = await this.getLinks(elem)
    links?.forEach((link) => {
      doc += `\n- [[${link.data.target}]]`
    })
    fs.writeFileSync(fpath, doc, "utf8")
    clog.log("wrote doc to", fpath)
  }
}

export { VaultMaker }

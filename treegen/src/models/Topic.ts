import fs, { mkdirSync } from "fs"
import path, { dirname } from "path"
import { GenerateOptions, TopicGraph } from "../appTypes.js"
import { Clog } from "../utils/Clog.js"
import { safeName } from "../utils/dirpath.js"
import { AppConfig } from "../config/AppConfig.js"
import yaml from "js-yaml"
import { TopicBuilder } from "./TopicBuilder.js"

const clog = new Clog()

export class Topic {
  // skipCache = AppConfig.USE_TOPIC_CACHE === "yes"
  useCache = true
  topicData?: TopicGraph
  topicName: string
  safeName: string
  options?: GenerateOptions

  constructor(topicName: string, opts?: GenerateOptions) {
    this.options = opts
    this.topicName = topicName
    this.safeName = safeName(topicName)
    this.useCache = opts?.useCache || false
    clog.log("useCache", this.useCache)
  }

  async genGraph() {
    const topicName = this.topicName
    if (this.useCache) {
      const cached = await this.loadTopicFile(topicName)
      if (cached) return cached
    }
    const builder = new TopicBuilder(topicName, this.options)
    this.topicData = await builder.buildTopic()
    return this.topicData
  }

  getPath(format?: "json" | "yaml"): string {
    const fpath = path.join(
      AppConfig.rootPath,
      `../../b3vault/${this.safeName}/${this.safeName}.${format}`
    )
    mkdirSync(dirname(fpath), { recursive: true })
    return fpath
  }

  // load from filesystem
  async loadTopicFile(topicName: string) {
    if (!this.useCache) return
    const fpath = this.getPath("yaml")
    if (!fs.existsSync(fpath)) {
      clog.warn("no existing topic file, making new", {
        topicName,
        fname: fpath,
      })
      return
    }

    const raw = fs.readFileSync(fpath, "utf8")
    // const topicData = JSON.parse(raw) as TopicGraph
    const topicData = yaml.load(raw) as TopicGraph
    clog.log("return cached topic", {
      topicName,
      elems: topicData.elements.length,
    })
    return topicData
  }

  // write full graph to a yaml file
  async writeGraph(topicGraph: TopicGraph, format: "json" | "yaml" = "yaml") {
    const fpath = this.getPath(format)
    const sorted = topicGraph.elements.sort((a, b) => {
      return a.data.type > b.data.type ? 1 : -1
    })

    topicGraph.elements = sorted

    if (fs.existsSync(fpath)) {
      clog.warn("file exists", { fname: fpath })
      // return
    }
    clog.log("writing topicGraph", { fname: fpath })

    let blob =
      format === "json"
        ? JSON.stringify(topicGraph, null, 2)
        : yaml.dump(topicGraph)

    fs.writeFileSync(fpath, blob)
  }
}

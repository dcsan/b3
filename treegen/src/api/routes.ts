import { Application } from "express"
import { NodeChatRequest } from "../appTypes.js"
import { AppConfig } from "../config/AppConfig.js"
import { expandTopic } from "../topics/expandTopic.js"
import { getDetail } from "../topics/getDetail.js"
import { getNodeChat } from "../topics/getNodeChat.js"
import { getTopicGraph } from "../topics/getTopicGraph.js"
import { getTopicList } from "../topics/getTopicList.js"

export async function setupRoutes(app: Application) {
  app.get("/", (_req: any, res) => {
    const text = `KB v${AppConfig.version}`
    res.send(text)
  })

  app.all("/api/topics/expand", async (req: any, res) => {
    const data = await expandTopic(req.body?.data)
    res.json({ data })
  })

  app.all("/api/topics/detail", async (req: any, res) => {
    const data = await getDetail(req.body?.data)
    res.json({ data })
  })

  // topicGraph
  app.all("/api/topics/:topicName", async (req: any, res) => {
    const topicName = req.params.topicName.toLowerCase()
    const data = await getTopicGraph(topicName)
    res.json({ data })
  })

  // topicList
  app.all("/api/topics", async (_req: any, res) => {
    const topics = await getTopicList()
    // console.log("topics", topics)
    res.json({ data: topics })
  })

  app.all("/api/chat", async (req: any, res) => {
    const data = await getNodeChat(req.body?.data as NodeChatRequest)
    console.log("api/chat", data)
    res.json({ data })
  })
}

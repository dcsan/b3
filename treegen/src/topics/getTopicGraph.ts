import { TopicGraph } from "../appTypes.js"
import { Topic } from "../models/Topic.js"
import { Clog } from "../utils/Clog.js"

const clog = new Clog()

export async function getTopicGraph(
  topicName: string
): Promise<TopicGraph | undefined> {
  const topic = new Topic(topicName)
  const topicData = await topic.genGraph()
  clog.log("topic=>", { data: topicData })
  return topicData
}

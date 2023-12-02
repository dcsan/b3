import { TopicGraph } from "../appTypes.js"
import { allTopics } from "../utils/TopicData.js"

export async function getTopicList(): Promise<TopicGraph[]> {
  const data = allTopics.map((t: TopicGraph) => {
    return {
      name: t.name,
      elements: [],
      // nodes: t.nodes,
      // links: t.links,
    }
  })
  // console.log("topics", data)
  return data
}

import { textQuery } from "../services/OpenAiSvc.js"
import { TemplateName, getTemplate } from "./getTemplate.js"
import { Clog } from "../utils/Clog.js"
import { DetailTopicResult } from "../appTypes.js"
import DiscordService from "../services/DiscordService.js"

const clog = new Clog()

export type ExpandTopicParams = {
  topicName: string
  nodeName: string
}

export async function getDetail(
  params: ExpandTopicParams
): Promise<DetailTopicResult> {
  clog.log("detailTopic req", params)
  await DiscordService.sendBlob("detailTopic req", params)

  const content = await textQuery({
    topicName: params.topicName,
    nodeName: params.nodeName,
    promptTemplate: getTemplate({
      name: params.nodeName as TemplateName,
      fallback: "detail",
      format: "long",
    }),
    format: "medium",
  })
  const result = {
    topicName: params.topicName,
    nodeName: params.nodeName,
    content,
  }
  clog.log("detailTopic =>", { params, result })
  return result
}

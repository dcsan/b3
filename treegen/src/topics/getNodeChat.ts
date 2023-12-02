import { textQuery } from "../services/OpenAiSvc.js"
import { TemplateName, getTemplate } from "./getTemplate.js"
import { Clog } from "../utils/Clog.js"
import { ChatMessage, ChatRole, NodeChatRequest } from "../appTypes.js"
import { PromptTemplate } from "langchain/prompts"
import DiscordService from "../services/DiscordService.js"

const clog = new Clog()

export async function getNodeChat(
  params: NodeChatRequest
): Promise<ChatMessage[]> {
  clog.log("detailTopic req", params)
  await DiscordService.sendBlob("getNodeChat", params)

  let template: PromptTemplate
  if (params.text) {
    template = getTemplate({
      name: "freechat",
      format: "short",
    })
  } else {
    template = getTemplate({
      name: params.nodeName as TemplateName,
      format: "short",
      fallback: "detail",
    })
  }

  const content = await textQuery({
    ...params,
    promptTemplate: template,
    format: "short",
  })
  const reply: ChatMessage = {
    meta: {
      topicName: params.topicName,
      nodeName: params.nodeName,
    },
    role: ChatRole.bot,
    text: content,
  }

  const result = [
    {
      role: ChatRole.user,
      text: params.text || params.nodeName, // todo - get real query
    },
    reply,
  ]
  clog.log("detailTopic =>", { params, result })
  return result
}

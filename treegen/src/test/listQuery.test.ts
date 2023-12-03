import { expect, test } from "vitest"
import { OpenAiQueryOptions, listQuery } from "../services/OpenAiSvc"
import { getTemplate } from "../topics/getTemplate"
import exp from "constants"

test("list query", async () => {
  const input = `Architecture`
  const query: OpenAiQueryOptions = {
    topicName: "cheese",
    promptTemplate: getTemplate({ templateName: "concepts" }),
    nodeName: "categories",
    text: input,
    count: "five",
  }
  const output = await listQuery(query)
  expect(output).toStrictEqual([
    "fermentation",
    "aging",
    "cultures",
    "coagulation",
    "texture",
  ])
})

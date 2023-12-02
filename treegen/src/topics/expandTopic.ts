import { ElementDefinition } from "cytoscape";
import { listQuery } from "../services/OpenAiSvc.js";
import { TemplateName, getTemplate } from "./getTemplate.js";
import { Clog } from "../utils/Clog.js";

const clog = new Clog();

export type ExpandTopicParams = {
  topicName: string;
  nodeName: string;
};

export async function expandTopic(
  params: ExpandTopicParams
): Promise<ElementDefinition[]> {
  clog.log("expandTopic req", params);
  const content = await listQuery({
    topicName: params.topicName,
    nodeName: params.nodeName,
    promptTemplate: getTemplate({
      name: params.nodeName as TemplateName,
      fallback: "expand",
      format: "list",
    }),
  });
  const nodes = content.map((node) => {
    return { data: { id: node } };
  });
  const links = content.map((node) => {
    return { data: { source: params.nodeName, target: node } };
  });
  const elements: ElementDefinition[] = [...nodes, ...links];
  clog.log("expandTopic =>", { params, elements });
  return elements;
}

import { GenerateOptions } from "../appTypes"

export const genOptions: GenerateOptions = {
  useCache: false,
  depth: 1,
  // breadth: "three", // should be in english for the prompt
  breadth: "one",
  tags: true,
  text: true,
}

import { GenerateOptions } from "../appTypes"

export const genOptions: GenerateOptions = {
  useCache: false,
  depth: 2,
  // breadth: "three", // should be in english for the prompt
  breadth: "two",
  tags: true,
  text: true,
}

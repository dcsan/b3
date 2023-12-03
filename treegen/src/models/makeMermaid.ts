import { TopicGraph } from "../appTypes"

export const makeMindmap = (graph: TopicGraph) => {
  const tpl = template
  const nodes = graph.elements.filter((elem) => elem.data.type === "node")
  const nodeNames = nodes.map((node) => node.data.id)
  // const lines = nodes.map((node) => `${node}`)
  const text = nodeNames.join("\n    ")
  const doc = tpl.replace("{{graph}}", text)
  return doc
}

const template = `

\`\`\`mermaid

mindmap
  root((mindmap))
    {{graph}}

\`\`\`

`

// Origins
//       Long history
//       ::icon(fa fa-book)
//       Popularisation
//         British popular psychology author Tony Buzan
//     Research
//       On effectiveness<br/>and features
//       On Automatic creation
//         Uses
//             Creative techniques
//             Strategic planning
//             Argument mapping
//     Tools
//       Pen and paper
//       Mermaid

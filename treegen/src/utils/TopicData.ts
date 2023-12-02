import { TopicGraph } from "../appTypes.js"

const baseTopics = [
  {
    name: "decentralization",
    type: "concept",
  },
  {
    name: "decolonization",
    type: "concept",
  },
  {
    name: "social graph",
    type: "concept",
  },
  {
    name: "tokenomics",
    type: "concept",
  },
  {
    name: "quadratic voting",
    type: "concept",
  },
  {
    name: "bonding curve",
    type: "concept",
  },
  {
    name: "International Fixed Calendar",
    type: "concept",
  },
  {
    name: "Emotional Quotient vs IQ",
    type: "concept",
  },
  {
    name: "Decision Trees",
    type: "concept",
  },
  {
    name: "DAO",
    type: "concept",
  },
  {
    name: "copyright",
    type: "concept",
  },
  {
    name: "software patents",
    type: "concept",
  },
  {
    name: "prediction markets",
    type: "concept",
  },

  {
    name: "Nikola Tesla",
    type: "person",
  },
  {
    name: "Henry Ford",
    type: "person",
  },
  {
    name: "Thomas Edison",
    type: "person",
  },
  {
    name: "Thomas Jefferson",
    type: "person",
  },
  {
    name: "Benjamin Franklin",
    type: "person",
  },
  {
    name: "John Locke",
    type: "person",
  },
  {
    name: "Karl Marx",
    type: "person",
  },
  {
    name: "Adam Smith",
    type: "person",
  },
  {
    name: "Milton Friedman",
    type: "person",
  },
  {
    name: "Alan Turing",
    type: "person",
  },
  {
    name: "Isaac Newton",
    type: "person",
  },
  {
    name: "Albert Einstein",
    type: "person",
  },
  {
    name: "Charles Darwin",
    type: "person",
  },
  {
    name: "Stephen Hawking",
    type: "person",
  },
  {
    name: "Richard Feynman",
    type: "person",
  },
  {
    name: "Buckminster Fuller",
    type: "person",
  },
  {
    name: "George Orwell",
    type: "person",
  },
  {
    name: "Mark Twain",
    type: "person",
  },
  {
    name: "Oscar Wilde",
    type: "person",
  },
  {
    name: "Napoleon",
    type: "person",
  },
  {
    name: "Marcus Aurelius",
    type: "person",
  },
  {
    name: "Plato",
    type: "person",
  },
  {
    name: "Sun Tzu",
    type: "person",
  },
  {
    name: "Machiavelli",
    type: "person",
  },
  {
    name: "philosophy",
    type: "concept",
  },
  {
    name: "economics",
    type: "concept",
  },
  {
    name: "game theory",
    type: "concept",
  },
  {
    name: "physics",
    type: "concept",
  },
  {
    name: "calculus",
    type: "concept",
  },
  {
    name: "algebra",
    type: "concept",
  },
  {
    name: "geometry",
    type: "concept",
  },
  {
    name: "genetics",
    type: "concept",
  },
  {
    name: "biology",
    type: "concept",
  },
  {
    name: "chemistry",
    type: "concept",
  },
  {
    name: "history",
    type: "concept",
  },
  {
    name: "geography",
    type: "concept",
  },
  {
    name: "statistics",
    type: "concept",
  },
  {
    name: "Religion",
    type: "concept",
  },
  {
    name: "Conspiracy Theories",
    type: "concept",
  },
  {
    name: "Jim Jones",
    type: "concept",
  },
  {
    name: "Dunbar's number",
    type: "concept",
  },
  {
    name: "Overton window",
    type: "concept",
  },
  {
    name: "Dunning Kruger Effect",
    type: "concept",
  },
  {
    name: "Cognitive Dissonance",
    type: "concept",
  },
  {
    name: "Occam's Razor",
    type: "concept",
  },
  {
    name: "Pareto Principle",
    type: "concept",
  },
  {
    name: "Peter Principle",
    type: "concept",
  },
  {
    name: "Parkinson's Law",
    type: "concept",
  },
  {
    name: "Gresham's Law",
    type: "concept",
  },
  {
    name: "Moore's Law",
    type: "concept",
  },
  {
    name: "Metcalfe's Law",
    type: "concept",
  },
  {
    name: "Reed's Law",
    type: "concept",
  },
  {
    name: "Sturgeon's Law",
    type: "concept",
  },
  {
    name: "Zipf's Law",
    type: "concept",
  },
  {
    name: "Goodhart's Law",
    type: "concept",
  },
  {
    name: "Campbell's Law",
    type: "concept",
  },
  {
    name: "Battle of Waterloo",
    type: "event",
  },
  {
    name: "Battle of Gettysburg",
    type: "event",
  },
  {
    name: "Battle of Stalingrad",
    type: "event",
  },
  {
    name: "Battle of Hastings",
    type: "event",
  },
  {
    name: "Zeus",
    type: "person",
  },
  {
    name: "Hera",
    type: "person",
  },
  {
    name: "Poseidon",
    type: "person",
  },
]

let topicItems = baseTopics.map((topic) => {
  return { ...topic, elements: [] }
})
topicItems = topicItems.sort((a, b) => {
  return a.type.localeCompare(b.type) || a.name.localeCompare(b.name)
})

// export const allTopics: TopicGraph[] = [...extraTopics, testTopic]
export const allTopics: TopicGraph[] = topicItems

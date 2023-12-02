import { expect, test } from "vitest"

import { basicReplace, cleanText, splitList } from "../utils/TextUtils"

test("should parse", async () => {
  const input =
    "1. Automation 2. Cognitive work 3. Trust 4. Estates documents 5. Legal domain"

  const items = splitList(input)
  expect(items).toStrictEqual([
    "Automation",
    "Cognitive work",
    "Trust",
    "Estates documents",
    "Legal domain",
  ])
})
test("should parse longwords", async () => {
  const input =
    '1. "complex" 2. "rarest" 3. "separated" 4. "following" 5. "comma"'

  const items = splitList(input)
  expect(items).toStrictEqual([
    "complex",
    "rarest",
    "separated",
    "following",
    "comma",
  ])
})

test("basic replacers", async () => {
  const text = "Rob Tersik"
  const output = basicReplace(text)
  expect(output).toBe("Rob Tercek")
})

test("clean text", async () => {
  const input = `\"This is the Jim Rutt Show.\"`
  const output = cleanText(input)
  expect(output).toBe("This is the Jim Rutt Show.")
})

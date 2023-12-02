import { basicReplacers } from "./BasicReplacers.js"

export function splitList(text?: string): string[] | undefined {
  if (!text) return
  text = text.replace(/:/gim, " ").trim()
  text = text.replace(/"/gim, " ").trim()
  text = text.replace(/[0-9]./gim, " , ").trim() // 1. - needs a period
  text = text.replace(/\n/gim, " ").trim()
  const keywords = text
    .split(",")
    .map((kw) => kw.trim())
    .filter((kw) => kw.length > 0)
  return keywords
}

export function basicReplace(text: string): string {
  for (let item of basicReplacers) {
    const rex = item[0]
    const rep = item[1]
    text = text.replace(rex, rep)
  }
  return text
}

export function cleanText(text: string): string | undefined {
  if (!text) return
  text = text.replace(/"/gim, " ").trim()
  text = text.replace(/\\/gim, " ").trim()
  // text = text.replace(/\n/gim, " ").trim()
  return text
}

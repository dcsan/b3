export function safeName(name: string) {
  if (!name) return "no-name"
  // remove non alpha
  name = name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()
  name = name.replace(/:|\.$/, "") // end trailing punctuation
  name = name.replace(/^•/, "") // start punctuation
  name = name.toLowerCase().trim()

  return name
}

export function removeLineNumbers(name: string) {
  name = name.replace(/^[0-9]+\. /, "")
  return name
}

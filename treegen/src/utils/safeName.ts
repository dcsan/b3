export function safeName(name: string) {
  if (!name) return "no-name"
  // remove non alpha

  name = name.toLowerCase().trim()
  name = name.replace(/^[0-9]+\. /, "") // leading digits
  name = name.toLowerCase().trim()
  name = name.replace(/[^a-zA-Z0-9]/g, "_") // non alpha to dash

  name = name.replace(/:|\.$/, "") // end trailing punctuation
  name = name.replace(/^•/, "") // start bullet
  name = name.replace(/:|\.$/, "") // end trailing punctuation
  name = name.replace(/^•/, "") // start punctuation
  name = name.trim()
  name = name.replace(/^-/, "") // start punctuation
  name = name.replace(/^_/, "") // start punctuation
  name = name.replace("--", "") // start punctuation
  name = name.replace("-", "") // start punctuation
  name = name.replace(/-$/, "") // start punctuation
  name = name.replace(/_$/, "") // start punctuation
  name = name.trim()

  return name
}

export function removeLineNumbers(name: string) {
  name = name.replace(/^[0-9]+\. /, "")
  return name
}

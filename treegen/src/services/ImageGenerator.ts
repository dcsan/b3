import fetch from "node-fetch"
import fs from "node:fs"
import { AppConfig } from "../config/AppConfig.js"
import { Clog } from "../utils/Clog.js"

export interface GenerationResponse {
  artifacts: Array<{
    base64: string
    seed: number
    finishReason: string
  }>
}

export type GeneratorOptions = {
  cfg_scale: number
  height: number
  width: number
  steps: number
  samples: number
  prefix: string
  suffix: string
}

const clog = new Clog()

const defaultOptions: GeneratorOptions = {
  cfg_scale: 7,
  height: 1024,
  width: 1024,
  steps: 30,
  samples: 1,
  prefix: "",
  suffix: "",
}

export class ImageGenerator {
  // engineId = "stable-diffusion-v1-6"
  engineId = "stable-diffusion-xl-1024-v1-0"
  apiHost = "https://api.stability.ai"
  opts: GeneratorOptions

  constructor(opts: GeneratorOptions) {
    this.opts = { ...defaultOptions, ...opts }
  }

  async generate(text: string, fpath: string, opts?: GeneratorOptions) {
    const options = { ...this.opts, ...opts }

    text = options.prefix + text + options.suffix
    clog.log("text", text)

    const response = await fetch(
      `${this.apiHost}/v1/generation/${this.engineId}/text-to-image`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${AppConfig.STABILITY_API_KEY}`,
        },
        body: JSON.stringify({
          text_prompts: [
            {
              text,
            },
          ],
          ...options,
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Generator FAIL: ${await response.text()}`)
    }

    const responseJSON = (await response.json()) as GenerationResponse

    responseJSON.artifacts.forEach((image, index) => {
      console.log(`Writing image ${index} to ${fpath}`)
      fs.writeFileSync(fpath, Buffer.from(image.base64, "base64"))
    })
  }
}

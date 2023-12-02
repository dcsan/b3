import fetch from "node-fetch"
import fs from "node:fs"
import { AppConfig } from "../config/AppConfig"
import { GenerationResponse } from "./ImageGenerator"

const engineId = "stable-diffusion-v1-6"
const apiHost = process.env.API_HOST ?? "https://api.stability.ai"
const apiKey = AppConfig.STABILITY_API_KEY
if (!apiKey) throw new Error("Missing Stability API key.")

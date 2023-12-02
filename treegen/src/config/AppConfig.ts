import "dotenv/config"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import DiscordService from "../services/DiscordService.js"

const version = "0.0.11"

// const config =
//   process.env.NODE_ENV !== "production" ? await import("dotenv") : null;

function getRootPath() {
  const configPath = dirname(fileURLToPath(import.meta.url))
  const rootPath = path.join(configPath, "..")
  return rootPath
}

export function getEnv(key: string): string {
  const val = process.env[key]
  if (!val) {
    console.error("ERROR missing env var: " + key)
  }
  return val || ""
}

export const AppConfig = {
  version,
  PORT: process.env.PORT || 8080,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NODE_ENV: process.env.NODE_ENV || "production",
  APP_NAME: process.env.APP_NAME,
  rootPath: getRootPath(),
  dataPath: `${getRootPath()}/data`,
  storyPath: `${getRootPath()}/data/stories`,
  metaFilePath: `${getRootPath()}/data/meta/allMeta.yaml`,
  USE_TOPIC_CACHE: getEnv("USE_TOPIC_CACHE"),
  DISHOOK: getEnv("DISHOOK"),
  STABILITY_API_KEY: getEnv("STABILITY_API_KEY"),
  ASSEMBLY_API_KEY: getEnv("ASSEMBLY_API_KEY"),
}

await DiscordService.sendBlob("startup: ", {
  NODE_ENV: AppConfig.NODE_ENV,
  version: AppConfig.version,
})

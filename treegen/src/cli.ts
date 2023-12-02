#!/usr/bin/env ts-node

import { TranscriptParser } from "./models/TranscriptParser.js"
import { assemblyMgr } from "./services/AssemblyMgr.js"
import { Clog } from "./utils/Clog.js"
import { StoryMgr } from "./models/StoryMgr.js"
import { VaultMaker } from "./models/VaultMaker.js"
// import { transcribeSpeech } from "./services/TranscribeGoogle.js"

const clog = new Clog()

async function runCli() {
  const cmd = process.argv[2]
  const args = process.argv.slice(3)
  const cname = args[0]
  const scriptParser = new TranscriptParser()

  switch (cmd) {
    case "chunk":
      await scriptParser.chunkScript(cname)
      break

    case "cleanChunked":
      await scriptParser.cleanChunked(cname)
      break

    //--------- transcripts ---------

    case "transStart":
      await assemblyMgr.transStart(cname)
      break

    case "transFetch":
      await assemblyMgr.transFetch(cname)
      break

    case "transFetchWait":
      await assemblyMgr.transFetchWait(cname)
      break

    // case "transFetchAll":
    //   const fetched = await assemblyMgr.fetchAll()
    //   clog.log("fetched", fetched)
    //   break

    case "transList":
      const items = await assemblyMgr.transList()
      clog.log("items", items)
      break

    // case "renderImage":
    //   const params: RenderParams = {
    //     text: "Hello World",
    //     color: "#00FFFF",
    //   }
    //   await renderImage(params)
    //   break

    case "loadStory":
      await StoryMgr.loadDbFromFile(cname)
      break

    case "addMeta":
      await StoryMgr.addMeta(cname)
      break

    case "addDuration":
      await StoryMgr.addDuration(cname)
      break

    case "genImages":
      await StoryMgr.generateChapterImages(cname)
      break

    case "redoOne":
      await StoryMgr.redoOne(cname)
      break

    case "redoAll":
      await StoryMgr.redoAll()
      break

    case "dump":
      await StoryMgr.dump(cname)
      break

    case "dumpAll":
      await StoryMgr.dumpAll()
      break

    case "vault":
      const vaultMaker = new VaultMaker(cname)
      await vaultMaker.make()
      break

    default:
      console.log(`Unknown command: ${cmd}`)
      break
  }
}

runCli()

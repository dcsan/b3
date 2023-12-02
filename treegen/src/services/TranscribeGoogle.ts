// const speech = require("@google-cloud/speech")
import speech from "@google-cloud/speech"
import fs from "fs"
import path from "path"
import { AppConfig } from "../config/AppConfig.js"
import { Clog } from "../utils/Clog.js"
import { TranscribeOpts } from "../config/serverTypes.js"

const clog = new Clog()

// Instantiates a client.
const client = new speech.SpeechClient()

// The path to the remote audio file.
// https://storage.cloud.google.com/kbxt-404306_cloudbuild/audio-files/sample.mp3
// "gs://kbxt-404306_cloudbuild/audio-files/JRS-EP-188-Robert-Tercek.mp3"

export async function logData(opts: TranscribeOpts, data: any) {
  const blob = JSON.stringify(data, null, 2)
  const fpath = path.join(
    AppConfig.rootPath,
    `./data/transcripts/${opts.outputJson}`
  )

  fs.writeFileSync(fpath, blob)
}

export async function transcribeSpeech(opts: TranscribeOpts) {
  const audio = {
    uri: opts.audioUrl,
  }

  // Transcribes your audio file using the specified configuration.
  const config = {
    model: "latest_long",
    encoding: "MP3",
    sampleRateHertz: 44100,
    audioChannelCount: 2,
    enableWordTimeOffsets: true,
    enableWordConfidence: true,
    diarizationConfig: {
      enableSpeakerDiarization: true,
      minSpeakerCount: 2,
      maxSpeakerCount: 2,
    },
    languageCode: "en-US",
  }

  const request = {
    audio: audio,
    config: config,
  }

  // Detects speech in the audio file. This creates a recognition job that you
  // can wait for now, or get its result later.
  // @ts-ignore
  const [operation] = await client.longRunningRecognize(request)
  clog.log("operation", operation)

  // Get a Promise representation of the final result of the job.
  const [response] = await operation.promise()
  // clog.log("response", response)
  const transcription = response.results
    .map((result: any) => {
      result.alternatives[0].transcript
    })
    .join("\n")
  console.log(`Transcription: ${transcription}`)
  logData(opts, response.results)
  console.log(`results:`, JSON.stringify(response.results, null, 2))
}

// transcribeSpeech()

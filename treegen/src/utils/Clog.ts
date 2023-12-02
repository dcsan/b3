import chalk from "chalk"

/**
 * Clog will log and format to console for Mac only
 * but use normal cloud Logger when deployed
 */

/**
 * uses DEBUG_LEVEL from env
 * 5 = error
 * 4 = warn
 * 3 = info
 * 2 = debug
 * 1 = trace
 */

const DebugLevels = {
  error: 1,
  warn: 2,
  log: 3, // default
  info: 4,
  debug: 5,
}

const log = console.log

export class Clog {
  debugLevel = 1
  platform = process.platform
  isMac: boolean = false
  name: string = ""

  constructor(name?: string, opts: { debugLevel?: number } = {}) {
    this.debugLevel = opts.debugLevel || 5
    this.isMac = this.platform === "darwin"
    this.name = name || ""
  }

  // only log on Mac not in cloud
  log(msg: string, obj: any) {
    if (!this.shouldLog(DebugLevels.log)) return
    // format for mac
    // msg = `\u001b[33m ${this.name} | ${msg}\x1b[0m`
    let blob = this.unwrap(obj)
    // console.log(msg, blob)
    log(
      `[${chalk.green(this.name)}|${chalk.blue(msg)}] \n` + chalk.yellow(blob)
    )
  }

  // safe unwrap for BigInts etc that cannot stringify easily
  unwrap(obj: any) {
    try {
      const blob = JSON.stringify(obj, null, 2)
      return blob
    } catch (err) {
      // stringify cannot handle BigInts/Decimal types
      // const safeObj = sanitizeForJSONSync(obj);
      const safeObj = obj
      try {
        const blob = JSON.stringify(safeObj, null, 2)
        return blob
      } catch (err) {
        // really give up
        return safeObj
      }
    }
  }

  warn(msg: string, obj: any) {
    if (this.shouldLog(DebugLevels.warn)) {
      console.warn(" \u001b[93m ⚠️ WARN: " + msg, this.unwrap(obj))
    } else {
      // we'll still log to google cloud but not to console
      // LogWarn(msg, "warn", "warn", "dc", obj);
    }
  }

  error(msg: string, obj: any) {
    if (this.shouldLog(DebugLevels.warn)) {
      console.error("  \u001b[31m ❌ ERROR: " + msg, this.unwrap(obj))
    } else {
      // LogError(msg, "warn", "warn", "dc", obj); // always log to cloud
    }
  }

  // only log on Mac and if debugLevel >= env level
  shouldLog(level: number) {
    if (!this.isMac) return false // fast fail
    if (this.debugLevel < level) return false
    return true
  }

  info(msg: string, obj: any) {
    if (!this.shouldLog(DebugLevels.info)) return
    msg = `\u001b[34m[info] ${msg}\x1b[0m\n`
    console.log(msg, this.unwrap(obj))
  }

  // print a polygon transaction hash
  txHash(msg: string, hash: string, network: "mumbai" | "mainnet" = "mumbai") {
    if (!this.shouldLog(DebugLevels.info)) return
    const prefix = network === "mumbai" ? "https://mumbai." : "https://"
    const url = `${prefix}polygonscan.com/tx/${hash}`
    this.log(msg, { hash, url })
  }

  // without a newline
  line(msg: string) {
    if (!this.shouldLog(DebugLevels.info)) return
    process.stdout.write(msg)
  }
}

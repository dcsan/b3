import { AppConfig } from "../config/AppConfig.js"
import { Clog } from "../utils/Clog.js"
import { DiscordEmbed, DiscordEmbedMessage } from "./DiscordTypes.js"

export enum DiscordChannels {
  DISHOOK,
}

const clog = new Clog()

const getChannelAddress = (_channel: DiscordChannels): string => {
  return AppConfig.DISHOOK!
}

class DiscordService {
  public async sendTextMessage(
    message: string,
    channel: DiscordChannels = DiscordChannels.DISHOOK
  ) {
    const channelAddress = getChannelAddress(channel)
    if (!channelAddress) return null

    const response = await fetch(channelAddress, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    })
    const body = await response.text()
    return body
  }

  quote(text: string) {
    const quoted = "```\n" + text + "\n```"
    return quoted
  }

  public async sendQuoteMessage(
    message: string,
    channel: DiscordChannels = DiscordChannels.DISHOOK
  ) {
    const quoted = this.quote(message)
    return this.sendTextMessage(quoted, channel)
  }

  public async sendBlob(
    text: string,
    obj: any,
    channel: DiscordChannels = DiscordChannels.DISHOOK
  ) {
    const blob = JSON.stringify(obj, null, 2)
    const quoted = this.quote(blob)
    const msg = text + "\n" + quoted
    await this.sendTextMessage(msg, channel)
  }

  /*
const response = await fetch(
      `https://discord.com/api/webhooks/989100610173411408/8uU1N2WiIqRJXrX9o6EO8midw5tUDsGGMK0ceIorKI8N1x1P3TULBMBg2GyKedhA7aoN`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: [discordPayload] }),
      }
    );
*/

  /**
   * send raw list of embeds
   * @param channel
   * @param embeds
   * @returns
   */
  public async sendEmbeds(
    embeds: DiscordEmbed[],
    channel: DiscordChannels = DiscordChannels.DISHOOK
  ) {
    const message = { embeds }
    return await this.sendMessage(message, channel)
  }

  /**
   * send message with content AND embeds
   * @param channel
   * @param message
   * @returns
   */
  public async sendMessage(
    message: DiscordEmbedMessage,
    channel: DiscordChannels = DiscordChannels.DISHOOK
  ) {
    const fetch = require("node-fetch")
    const channelAddress = getChannelAddress(channel)
    if (!channelAddress) {
      return null
    }

    function failSend(resOrError: any) {
      clog.error("fail to send discord message", { resOrError, message })
    }

    try {
      const response = await fetch(channelAddress, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      })
      if (response.status !== 204) {
        failSend(response)
      }
      return response
    } catch (e) {
      failSend(e)
      return e
    }
  }
}

export default new DiscordService()

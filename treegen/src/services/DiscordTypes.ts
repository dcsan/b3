// https://leovoel.github.io/embed-visualizer/
// https://discohook.org/

export type EmbedField = {
  name?: string
  value?: string | number
  inline?: boolean
}

export type DiscordEmbed = {
  title?: string
  description?: string
  url?: string
  color?: number
  timestamp?: string
  footer?: {
    icon_url: string
    text: string
  }
  thumbnail?: {
    url: string
  }
  image?: {
    url: string
  }
  author?: {
    name?: string
    url?: string
    icon_url?: string
  }
  fields?: EmbedField[]
}

export type DiscordEmbedMessage = {
  content?: string
  username?: string
  avatar_url?: string
  embeds?: DiscordEmbed[]
}

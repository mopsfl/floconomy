import { Colors, EmbedAuthorData, EmbedBuilder, EmbedField, EmbedFooterData, codeBlock } from "discord.js"
import { randomUUID } from "crypto"

export default function (args: { title?: string, description?: string, color?: any, timestamp?: boolean, author?: EmbedAuthorData, thumbnail?: string, image?: string, footer?: EmbedFooterData, fields?: Array<EmbedField> }) {
    const embed = new EmbedBuilder()

    try {
        args.color && embed.setColor(args.color)
        args.title && embed.setTitle(args.title)
        args.description && embed.setDescription(args.description)
        args.author && embed.setAuthor(args.author)
        args.thumbnail && embed.setThumbnail(args.thumbnail)
        args.image && embed.setImage(args.image)
        args.footer && embed.setFooter(args.footer)
        args.fields && embed.setFields(args.fields)
        args.timestamp && embed.setTimestamp()
    } catch (error) {
        console.error(error)
        throw new Error(error)
    }
    return embed
}
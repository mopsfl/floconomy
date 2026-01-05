import { Client, ApplicationEmoji } from "discord.js";

export default class EmojiManager {
    private cache = new Map<string, ApplicationEmoji>();
    private fetched = false;

    constructor(private readonly client: Client) { }

    private async fetchEmojis() {
        if (!this.client.application) {
            await this.client.application?.fetch()
        }

        const emojis = await this.client.application!.emojis.fetch()

        this.cache.clear()
        emojis.forEach(emoji => {
            this.cache.set(emoji.id, emoji)
            if (emoji.name) this.cache.set(emoji.name, emoji)
        })

        this.fetched = true
    }

    async GetEmoji(nameOrId: string): Promise<ApplicationEmoji | null> {
        if (!this.fetched) await this.fetchEmojis()

        return this.cache.get(nameOrId) ?? null
    }
}

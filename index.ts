import express from "express"
import dotenv from "dotenv"
import cors from "cors"

import Database from "./modules/Database/Database";
import CommandHandler from "./modules/CommandHandler";
import EmojiHandler from "./modules/Misc/EmojiHandler"

import {
    ActivityType,
    Client,
    Events,
    IntentsBitField,
    Partials,
    REST
} from "discord.js"

dotenv.config()

const START_TIME = Date.now()
const ENV: any = process.argv[2] || "prod"

const app = express(),
    discordREST = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN),
    client = new Client({
        intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.DirectMessages,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.MessageContent,
        ],
        partials: [Partials.Channel],
        presence: {
            status: "online",
            activities: [{
                name: "$67",
                type: ActivityType.Playing,
            }],
        },
    });

const commandHandler = new CommandHandler()
const emojiHandler = new EmojiHandler(client)

app.listen(process.env.PORT, async () => {
    console.log(`> server listening on port ${process.env.PORT}`)

    let _time = Date.now()
    console.log("> logging in discord client...");
    await client.login(process.env[ENV == "prod" ? "DISCORD_TOKEN" : "DISCORD_TOKEN_DEV"]).then(async () => {
        console.log(`> logged in as ${client.user.username} (took ${Date.now() - _time}ms)`)
    })
    await commandHandler.RegisterCommands()

    console.log(`> programm initalized in ${Date.now() - START_TIME}ms (enviroment: ${ENV})`)
})

client.on(Events.MessageCreate, commandHandler.OnMessageCreate.bind(commandHandler))
client.on(Events.InteractionCreate, commandHandler.OnInteractionCreate.bind(commandHandler))

export { client, discordREST, ENV, commandHandler, emojiHandler }
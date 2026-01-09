import { Command } from "../../modules/CommandHandler"
import { commandHandler } from "../../index"
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed"
import { bold, Colors } from "discord.js"

class CommandConstructor {
    name = ["work"]
    category = commandHandler.CommandCategories.Economy
    description = "Shows your balance."

    callback = async (command: Command) => {
        const [newData, value] = await UserManager.ModifyBalance(command.user, "cash", Math.round(
            Math.floor(Math.random() * (500 - 100)) + 100
        ))

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    description: `You worked like a pro and earned ${bold("$" + value.toString())}!`
                })
            ]
        })
    }
}

module.exports = CommandConstructor
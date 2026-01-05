import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import User from "../../modules/Economy/User";
import Embed from "../../modules/Misc/Embed";
import { bold, Colors } from "discord.js";

class CommandConstructor {
    name = ["work"]
    category = commandHandler.CommandCategories.Economy
    description = "Shows your balance."

    callback = async (command: Command) => {
        await User.IncrementValue(command.user, "cash", 100)

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    description: `You worked like a pro and earned ${bold("$100")}!`
                })
            ]
        })
    }
}

module.exports = CommandConstructor
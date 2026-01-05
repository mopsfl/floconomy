import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import { Colors } from "discord.js";
import Utils from "../../modules/Utils";
import User from "../../modules/Economy/User"
import Embed from "../../modules/Misc/Embed";

class CommandConstructor {
    name = ["balance", "bal"]
    category = commandHandler.CommandCategories.Economy
    description = "Shows your balance."

    callback = async (command: Command) => {
        const userData = await User.GetUserData(command.user)

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    author: {
                        name: `${command.user.username}'s Balance`,
                        iconURL: command.user.avatarURL()
                    },
                    fields: [
                        { name: `${await emojiHandler.GetEmoji("wallet")} Cash`, value: `-# ${Utils.FormatCash(userData.cash)}`, inline: true },
                        { name: `${await emojiHandler.GetEmoji("bank")} Bank`, value: `-# ${Utils.FormatCash(userData.bank)}`, inline: true }
                    ]
                })
            ]
        })
    }
}

module.exports = CommandConstructor
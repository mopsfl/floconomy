import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import { Colors, User } from "discord.js";
import Utils from "../../modules/Utils";
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed";
import { FloConomyUserData } from "../../modules/Economy/Types";

class CommandConstructor {
    name = ["profile", "pr"]
    category = commandHandler.CommandCategories.Economy
    description = "Shows your profile."

    callback = async (command: Command) => {
        let targetUser: User,
            userData: FloConomyUserData

        if (command.message.mentions.users.size > 0 && !command.message.mentions.everyone) {
            targetUser = command.message.mentions.users.first()
            userData = await UserManager.GetUserData(
                targetUser,
                targetUser.id !== command.user.id
            )
        } else {
            userData = await UserManager.GetUserData(command.user)
            targetUser = command.user
        }

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    author: {
                        name: `${targetUser.username}'s Profile`,
                        iconURL: targetUser.avatarURL()
                    },
                    fields: [
                        { name: `${await emojiHandler.GetEmoji("toolbox")} Job`, value: `-# ${userData.job}`, inline: false },
                        { name: `${await emojiHandler.GetEmoji("wallet")} Cash`, value: `-# $${Utils.FormatCash(userData.cash)}`, inline: true },
                        { name: "\u200B", value: "\u200B", inline: true },
                        { name: `${await emojiHandler.GetEmoji("bank")} Bank`, value: `-# $${Utils.FormatCash(userData.bank)}`, inline: true }
                    ]
                })
            ]
        })
    }
}

module.exports = CommandConstructor
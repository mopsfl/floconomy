import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import { Colors, User } from "discord.js";
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed";
import { FloConomyUserData } from "../../modules/Economy/Types";
import Dialogs from "../../modules/Dialogs";
import ErrorHandler from "../../modules/Misc/ErrorHandler/Handler"
import crypto from "crypto"
import Database from "../../modules/Database/Database";

class CommandConstructor {
    name = ["rob"]
    syntax_usage = "<user>"
    category = commandHandler.CommandCategories.Economy
    description = "Rob someone"

    callback = async (command: Command) => {
        let targetUser: User,
            userData: FloConomyUserData

        if (command.message.mentions?.users?.size > 0 && !command.message.mentions.everyone && !command.message.mentions.users?.first()?.bot) {
            targetUser = command.message.mentions.users.first()
            userData = await UserManager.GetUserData(
                targetUser,
                targetUser.id !== command.user.id
            )
        } else {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.ROBBERY.INVALID_TARGET)] })
            return
        }

        if (targetUser.id === command.user.id) {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.ROBBERY.CANT_ROB_YOURSELF)] })
            return
        }

        const targetUserCash = BigInt(userData.cash)
        let stealAmount: bigint

        if (targetUserCash <= 0n) {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.ROBBERY.TOO_POOR)] })
            return
        }

        if (targetUserCash <= 500n) {
            stealAmount = targetUserCash
        } else {
            stealAmount = BigInt(crypto.randomInt(1, Number(
                targetUserCash > BigInt(Number.MAX_SAFE_INTEGER) ? BigInt(Number.MAX_SAFE_INTEGER) : targetUserCash
            )))
        }

        await Database.Transaction(async (conn) => {
            await UserManager.ModifyBalance(targetUser, "cash", -stealAmount, conn)
            await UserManager.ModifyBalance(command.user, "cash", stealAmount, conn)

            UserManager.LogTransaction(targetUser.id, -stealAmount, "economy_modify", "robbery")
            UserManager.LogTransaction(command.user.id, stealAmount, "economy_modify", "robbery")
        }).then(async () => {
            command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Green,
                        description: `${await emojiHandler.GetEmoji("hatglasses")} Successfully robbed **$${stealAmount}** from <@${targetUser.id}>`
                    })
                ]
            })
        }).catch(async () => {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.UNEXPECTED_ERROR)] })
        })
    }
}

module.exports = CommandConstructor
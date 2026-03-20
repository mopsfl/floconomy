import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import { bold, Colors, User } from "discord.js";
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed";
import Dialogs from "../../modules/Dialogs";
import ErrorHandler from "../../modules/Misc/ErrorHandler/Handler"
import Database from "../../modules/Database/Database";

class CommandConstructor {
    name = ["give", "pay"]
    syntax_usage = "<user>"
    category = commandHandler.CommandCategories.Economy
    description = "Pay / give someone money."

    callback = async (command: Command) => {
        let targetUser: User,
            userData = await UserManager.GetUserData(command.user)

        const rawAmount = command.arguments[1]

        if (command.message.mentions?.users?.size > 0 && !command.message.mentions.everyone && !command.message.mentions.users?.first()?.bot) {
            targetUser = command.message.mentions.users.first()
        } else {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.INVALID_TARGET)] })
            return
        }

        if (targetUser.id === command.user.id) {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.PAY.CANT_PAY_YOURSELF)] })
            return
        }

        let amount: bigint

        if (typeof rawAmount === "string" && rawAmount.toLowerCase() === "all") {
            amount = userData.cash
        } else {
            if (!/^\d+$/.test(rawAmount)) {
                throw new SyntaxError("You can't pay $0!")
            }

            amount = BigInt(rawAmount)
        }

        if (amount > userData.cash) amount = userData.cash
        if (amount <= 0n) throw new Error(`unable to pay $${amount.toString()}`)

        await Database.Transaction(async (conn) => {
            await UserManager.ModifyBalance(targetUser, "cash", amount, conn)
            await UserManager.ModifyBalance(command.user, "cash", -amount, conn)
        }).then(async () => {
            command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Green,
                        description: `${await emojiHandler.GetEmoji("wallet")} Successfully gave <@${targetUser.id}> $${bold(amount.toString())}!`
                    })
                ]
            })

            UserManager.LogTransaction(targetUser.id, amount, "economy_modify", "pay")
            UserManager.LogTransaction(command.user.id, -amount, "economy_modify", "pay")
        }).catch(async () => {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.UNEXPECTED_ERROR)] })
        })
    }
}

module.exports = CommandConstructor
import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import UserManager from "../../modules/Economy/UserManager"
import { Colors, User } from "discord.js";
import Embed from "../../modules/Misc/Embed";
import { Transaction } from "../../modules/Economy/Types";

class CommandConstructor {
    name = ["transactions", "trs"]
    category = commandHandler.CommandCategories.Economy
    description = "Shows your recent transactions."

    callback = async (command: Command) => {
        let targetUser: User,
            transactionsData: Transaction[]

        if (command.message.mentions?.users?.size > 0 && !command.message.mentions.everyone && !command.message.mentions.users?.first()?.bot) {
            targetUser = command.message.mentions.users.first()
        } else {
            targetUser = command.user
        }

        transactionsData = await UserManager.GetUserTransactions(targetUser)

        const fieldValues = {
            type: "",
            amount: "",
            time: ""
        }

        transactionsData.forEach(transaction => {
            fieldValues.type += `-# ${transaction.origin !== "other" ? transaction.origin : transaction.type}\n`
            fieldValues.amount += `-# ${transaction.amount >= 0
                ? `$${transaction.amount}`
                : `-$${Math.abs(Number(transaction.amount))}`}\n`
            fieldValues.time += `-# <t:${Math.floor(transaction.created_at.getTime() / 1000)}:R>\n`
        })

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    author: {
                        name: `${command.user.username}'s Balance`,
                        iconURL: command.user.avatarURL()
                    },
                    fields: [
                        { name: `${await emojiHandler.GetEmoji("inbox")} Type`, value: fieldValues.type, inline: true },
                        { name: `${await emojiHandler.GetEmoji("money")} Amount`, value: fieldValues.amount, inline: true },
                        { name: `${await emojiHandler.GetEmoji("clock")} Time`, value: fieldValues.time, inline: true },
                    ]
                })
            ]
        })
    }
}

module.exports = CommandConstructor
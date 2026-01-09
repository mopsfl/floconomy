import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed";
import { Colors } from "discord.js";

class CommandConstructor {
    name = ["deposit", "dep"]
    category = commandHandler.CommandCategories.Economy
    description = "Deposit your cash to bank"

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)
        const rawAmount = command.arguments[0]

        let amount: bigint

        if (typeof rawAmount === "string" && rawAmount.toLowerCase() === "all") {
            amount = userData.cash
        } else {
            if (!/^\d+$/.test(rawAmount)) {
                throw new SyntaxError("you can't deposit $0")
            }

            amount = BigInt(rawAmount)
        }

        if (amount > userData.cash) amount = userData.cash
        if (amount <= 0n) throw new Error(`unable to deposit $${amount.toString()}`)

        await UserManager.Deposit(command.user, amount)

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    description: `${await emojiHandler.GetEmoji("bank")} Successfully deposited **$${amount}** to your bank`
                })
            ]
        })
    }
}

module.exports = CommandConstructor
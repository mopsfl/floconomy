import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import UserManager from "../../modules/Economy/UserManager"
import { Colors } from "discord.js";
import Embed from "../../modules/Misc/Embed";

class CommandConstructor {
    name = ["withdraw", "with", "wd"]
    category = commandHandler.CommandCategories.Economy
    description = "Withdraw money from your bank to your wallet."

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)
        const rawAmount = command.arguments[0]

        let amount: bigint

        if (typeof rawAmount === "string" && rawAmount.toLowerCase() === "all") {
            amount = userData.bank
        } else {
            if (!/^\d+$/.test(rawAmount)) {
                throw new SyntaxError("you can't withdraw $0")
            }

            amount = BigInt(rawAmount)
        }

        if (amount > userData.bank) amount = userData.bank
        if (amount <= 0n) throw new Error(`unable to withdraw $${amount.toString()}`)

        await UserManager.Withdraw(command.user, amount)

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    description: `${await emojiHandler.GetEmoji("bank")} Successfully withdrawed **$${amount}** to your wallet`
                })
            ]
        })
    }
}

module.exports = CommandConstructor
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
        let amount = command.arguments[0]

        if (!parseInt(amount)) {
            if (typeof (amount) === "string" && amount.toLowerCase() === "all") {
                amount = userData.cash
            } else {
                throw new SyntaxError("amount must be a number")
            }
        }

        amount = Math.min(Math.max(parseInt(amount), Math.abs(amount)), userData.cash)

        if (amount <= 0) {
            throw new Error(`unable to deposit $${amount}`)
        }

        await UserManager.IncrementValue(command.user, "cash", -amount)
        await UserManager.IncrementValue(command.user, "bank", amount)

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
import { Command } from "../../modules/CommandHandler"
import { commandHandler } from "../../index";
import UserManager from "../../modules/Economy/UserManager"

class CommandConstructor {
    name = ["withdraw", "with", "wd"]
    category = commandHandler.CommandCategories.Economy
    description = "Withdraw money from your bank to your wallet."

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)
        let amount = command.arguments[0]

        if (!parseInt(amount)) {
            if (typeof (amount) === "string" && amount.toLowerCase() === "all") {
                amount = userData.bank
            } else {
                throw new SyntaxError("amount must be a number")
            }
        }

        amount = Math.min(Math.max(parseInt(amount), Math.abs(amount)), userData.bank)

        if (amount <= 0) {
            throw new Error(`unable to withdraw $${amount}`)
        }

        await UserManager.IncrementValue(command.user, "cash", amount)
        await UserManager.IncrementValue(command.user, "bank", -amount)

        command.message.reply(`withdrawed $${amount}`)
    }
}

module.exports = CommandConstructor
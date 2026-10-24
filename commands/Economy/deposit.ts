import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed";
import { Colors } from "discord.js";
import ErrorHandler from "../../modules/Misc/ErrorHandler/Handler"
import Dialogs from "../../modules/Dialogs";

class CommandConstructor {
    name = ["deposit", "dep", "d"]
    category = commandHandler.CommandCategories.Economy
    description = "Deposit your cash to bank"

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)
        const rawAmount = command.arguments[0]?.toLowerCase();

        let amount: bigint;

        if (rawAmount === "all") {
            amount = userData.cash;
        } else if (rawAmount === "half") {
            amount = userData.cash / 2n;
        } else if (rawAmount && /^\d+%$/.test(rawAmount)) {
            const percentage = BigInt(rawAmount.slice(0, -1));

            if (percentage > 100n) {
                throw new SyntaxError("Percentage must be between 0% and 100%!");
            }

            amount = (userData.cash * percentage) / 100n;
        } else if (rawAmount && /^\d+\/\d+$/.test(rawAmount)) {
            const [numeratorStr, denominatorStr] = rawAmount.split("/");

            const numerator = BigInt(numeratorStr);
            const denominator = BigInt(denominatorStr);

            if (denominator === 0n) {
                throw new SyntaxError("The denominator cannot be zero!");
            }

            if (numerator > denominator) {
                throw new SyntaxError("The fraction cannot be greater than 1!");
            }

            amount = (userData.cash * numerator) / denominator;
        } else {
            if (!rawAmount || !/^\d+$/.test(rawAmount)) {
                throw new SyntaxError(
                    "Invalid amount! Use a number, 'half', 'all', a percentage (50%), or a fraction (1/3)."
                );
            }

            amount = BigInt(rawAmount);
        }

        if (amount > userData.cash) amount = userData.cash;

        if (amount <= 0n) {
            throw new Error("You must deposit at least $1!");
        }


        await UserManager.Deposit(command.user, amount).then(async () => {
            command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Green,
                        description: `${await emojiHandler.GetEmoji("bank")} Successfully deposited **$${amount}** to your bank`
                    })
                ]
            })
        }).catch(async () => {
            command.message.reply({ embeds: [await ErrorHandler.CreateCustomErrorEmbed(Dialogs.UNEXPECTED_ERROR)] })
        })
    }
}

module.exports = CommandConstructor
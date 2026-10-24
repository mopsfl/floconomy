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
    description = "Give someone money."

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
                throw new SyntaxError("Invalid amount! Use a number, 'half', 'all', a percentage (50%), or a fraction (1/3).");
            }

            amount = BigInt(rawAmount);
        }

        if (amount > userData.cash) amount = userData.cash;

        if (amount <= 0n) {
            throw new Error("You must deposit at least $1!");
        }

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
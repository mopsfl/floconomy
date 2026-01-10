import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index"
import UserManager from "../../modules/Economy/UserManager"
import Embed from "../../modules/Misc/Embed"
import { bold, Colors } from "discord.js"
import Dialogs from "../../modules/Dialogs"
import Jobs from "../../modules/Jobs/Jobs"

class CommandConstructor {
    name = ["work"]
    category = commandHandler.CommandCategories.Jobs
    description = "Shows your balance."

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)

        if (!userData.job || userData.job === "Unemployed") {
            return command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Red,
                        author: {
                            name: Dialogs.JOB.NO_JOB,
                            iconURL: (await emojiHandler.GetEmoji("fail")).imageURL()
                        },
                        description: Dialogs.JOB.APPLY_FOR_JOB
                    })
                ]
            })
        }

        if (userData.last_worked !== null) {
            if ((Date.now() - userData.last_worked.getTime()) < 5000) {
                const elapsed = (Date.now() - userData.last_worked.getTime()) / 1000;
                const remaining = Math.max(0, 5 - elapsed).toFixed(0)

                return command.message.reply({
                    embeds: [
                        Embed({
                            color: Colors.Red,
                            author: {
                                name: Dialogs.JOB.WORK_COOLDOWN,
                                iconURL: (await emojiHandler.GetEmoji("fail")).imageURL()
                            },
                            description: `-# Try again in ${remaining} seconds!`
                        })
                    ]
                })
            }
        }

        const job = Object.values(Jobs).find(j => j.jobName.toLowerCase() === userData.job.toLowerCase()),
            salary = BigInt(Math.round(Math.floor(Math.random() * (job.salary[1] - job.salary[0])) + job.salary[0]))

        await UserManager.ModifyBalance(command.user, "cash", salary)

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    description: `You've worked as a ${bold(userData.job)} and earned ${bold("$" + salary.toString())}!`
                })
            ]
        })

        UserManager.LogTransaction(command.user.id, salary, "economy_modify", "salary")
        await UserManager.SetValue(command.user, "last_worked", new Date())
    }
}

module.exports = CommandConstructor
import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import Jobs from "../../modules/Jobs/Jobs";
import { bold, Colors, EmbedField } from "discord.js";
import Embed from "../../modules/Misc/Embed";
import UserManager from "../../modules/Economy/UserManager";
import Dialogs from "../../modules/Dialogs";

class CommandConstructor {
    name = ["apply", "apl"]
    category = commandHandler.CommandCategories.Jobs
    description = "Apply for a job."

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)
        const argumentInput = command.arguments[0]?.toLowerCase()

        if (userData.job !== "Unemployed") {
            return command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Red,
                        author: {
                            name: Dialogs.JOB.ALREADY_HAS_JOB,
                            iconURL: (await emojiHandler.GetEmoji("fail")).imageURL()
                        }
                    })
                ]
            })
        }

        if (!argumentInput) {
            const jobs: EmbedField[] = []

            Object.values(Jobs).forEach(job => {
                jobs.push({
                    name: `${job.jobName}`,
                    value: `-# $${job.salary[0]} - $${job.salary[1]}`,
                    inline: true
                })
            })

            command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Green,
                        description: `${await emojiHandler.GetEmoji("toolbox")} ${bold("Available Jobs")}`,
                        fields: jobs,
                    })
                ]
            })

            return
        }

        const jobToApply = Object.values(Jobs).find(j => j.jobName.toLowerCase() === argumentInput)

        if (!jobToApply) return command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Red,
                    author: {
                        name: Dialogs.JOB.UNKNOWN_JOB,
                        iconURL: (await emojiHandler.GetEmoji("fail")).imageURL()
                    }
                })
            ]
        })

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    title: `${await emojiHandler.GetEmoji("toolbox")} ${jobToApply.jobName}`,
                    description: Dialogs.JOB.APPLY_CONFIRM + "\n-# (yes you do, congrats on ur new job. this is temporarly until i coded this yessir)"
                })
            ]
        })

        await UserManager.SetValue(command.user, "job", jobToApply.jobName)
    }
}

module.exports = CommandConstructor
import { Command } from "../../modules/CommandHandler"
import { commandHandler, emojiHandler } from "../../index";
import Jobs from "../../modules/Jobs/Jobs";
import { bold, Colors, EmbedField } from "discord.js";
import Embed from "../../modules/Misc/Embed";
import UserManager from "../../modules/Economy/UserManager";
import Dialogs from "../../modules/Dialogs";

class CommandConstructor {
    name = ["quit", "quitjob"]
    category = commandHandler.CommandCategories.Jobs
    description = "Quit your current job."

    callback = async (command: Command) => {
        const userData = await UserManager.GetUserData(command.user)

        if (userData.job === "Unemployed") {
            return command.message.reply({
                embeds: [
                    Embed({
                        color: Colors.Red,
                        author: {
                            name: Dialogs.JOB.NO_JOB,
                            iconURL: (await emojiHandler.GetEmoji("fail")).imageURL()
                        }
                    })
                ]
            })
        }

        command.message.reply({
            embeds: [
                Embed({
                    color: Colors.Green,
                    description: Dialogs.JOB.QUIT_JOB
                })
            ]
        })

        await UserManager.SetValue(command.user, "job", "Unemployed")
    }
}

module.exports = CommandConstructor
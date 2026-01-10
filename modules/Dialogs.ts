import { inlineCode } from "discord.js";
import config from "../config";

export default {
    UNEXPECTED_ERROR: "An unexpected error occurred while trying to execute this process!",
    JOB: {
        NO_JOB: `You don't have a job yet!`,
        ALREADY_HAS_JOB: `You already have a job!`,
        UNKNOWN_JOB: `This is not a valid job!`,
        APPLY_FOR_JOB: `-# Apply for one using ${inlineCode(config.prefix + "apply")} to start earning money.`,
        APPLY_CONFIRM: `-# Would you like to apply for this job?`,
        WORK_COOLDOWN: `You can't work right now!`
    },
    ROBBERY: {
        TOO_POOR: "This person is too poor to be robbed!",
        INVALID_TARGET: "Invalid target!",
        CANT_ROB_YOURSELF: "You can't rob yourself?"
    }
}
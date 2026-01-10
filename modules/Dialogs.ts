import { inlineCode } from "discord.js";
import config from "../config";

export default {
    JOB: {
        NO_JOB: `You don't have a job yet!`,
        ALREADY_HAS_JOB: `You already have a job!`,
        UNKNOWN_JOB: `This is not a valid job!`,
        APPLY_FOR_JOB: `-# Apply for one using ${inlineCode(config.prefix + "apply")} to start earning money.`,
        APPLY_CONFIRM: `-# Would you like to apply for this job?`,
        WORK_COOLDOWN: `You can't work right now!`
    }
}
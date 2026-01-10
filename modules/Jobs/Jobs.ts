import { Constructor, Job } from "../Economy/Types";
import { CashierJob } from "./Cashier";

export default {
    Cashier: {
        jobName: "Cashier",
        salary: [150, 200],
        class: CashierJob
    },
} as {
    [index: string]: {
        jobName: Job,
        salary: number[],
        class: Constructor<any>
    }
}
export type FloConomyUserData = {
    user_id: string
    job?: Job
    cash: bigint
    bank: bigint
}

export const USER_DEFAULTS: Omit<FloConomyUserData, "user_id"> = {
    cash: 0n,
    bank: 0n,
    job: "Unemployed"
}

export type Job = "Unemployed" | "Cashier"
export type BalanceKey = "cash" | "bank"

export type TransactionType =
    | "deposit"
    | "withdraw"
    | "transfer"
    | "economy_set"
    | "economy_add"
    | "admin_set"
    | "admin_add"
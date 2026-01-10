export const USER_DEFAULTS: Omit<FloConomyUserData, "user_id"> = {
    cash: 0n,
    bank: 0n,
    job: "Unemployed",
    last_worked: null
}

export type FloConomyUserData = {
    user_id: string
    job?: Job
    cash: bigint
    bank: bigint,
    last_worked: Date
}

export type Transaction = {
    id: number,
    user_id: string,
    target_id?: string,
    amount: bigint,
    type: string,
    origin: string,
    created_at: Date
}

export type Job = "Unemployed" | "Cashier"
export type BalanceKey = "cash" | "bank"

export type TransactionOrigin =
    | "other"
    | "salary"

export type TransactionType =
    | "deposit"
    | "withdraw"
    | "transfer"
    | "economy_set"
    | "economy_add"
    | "admin_set"
    | "admin_add"

export type Constructor<T> = new (...args: any[]) => T
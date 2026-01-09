import { User } from "discord.js";
import Database from "../Database/Database";
import { FloConomyUserData, BalanceKey, TransactionType, USER_DEFAULTS } from "./Types";

export default {
    async GetUserData(user: User, dontRegister?: boolean): Promise<FloConomyUserData> {
        const response = await Database.GetTable<any>("users", {
            user_id: user.id
        })

        if (!response.success) {
            if (response.error.code === "notFound") {
                return await this.RegisterUser(user, dontRegister)
            }
            console.error(response.error)
            throw new Error("unable to receive user data from database")
        }

        const data = response.data
        let needsReconcile = false

        for (const key in USER_DEFAULTS) {
            if (data[key] == null) {
                data[key] = USER_DEFAULTS[key]
                needsReconcile = true
            }
        }

        if (needsReconcile) {
            Database.Update(
                "users",
                Object.fromEntries(
                    Object.entries(USER_DEFAULTS).map(([k]) => [
                        k,
                        typeof data[k] === "bigint" ? data[k].toString() : data[k]
                    ])
                ),
                { user_id: user.id }
            )
        }

        return {
            user_id: user.id,
            ...data
        } as FloConomyUserData
    },

    async ModifyBalance(user: User, key: BalanceKey, amount: number): Promise<[FloConomyUserData, number]> {
        const userData = await this.GetUserData(user)
        const newValue = userData[key] + BigInt(amount)

        if (newValue < 0n) {
            throw new Error(`${key} cannot go below 0`)
        }

        userData[key] = newValue

        const response = await Database.Update(
            "users",
            { [key]: newValue.toString() },
            { user_id: user.id }
        )

        if (!response.success) {
            throw new Error(response.error.sqlMessage)
        }

        return [userData, amount]
    },

    async Deposit(user: User, amount: bigint) {
        if (amount <= 0n) throw new Error("Invalid amount")

        await this.ModifyBalance(user, "cash", -amount)
        await this.ModifyBalance(user, "bank", amount)

        await this.LogTransaction(user.id, "deposit", amount)
    },

    async Withdraw(user: User, amount: bigint) {
        if (amount <= 0n) throw new Error("Invalid amount")

        await this.ModifyBalance(user, "bank", -amount)
        await this.ModifyBalance(user, "cash", amount)

        await this.LogTransaction(user.id, "withdraw", amount)
    },

    async LogTransaction(userId: string, type: TransactionType, amount: bigint, targetId?: string) {
        await Database.Insert("transactions", {
            user_id: userId,
            target_id: targetId ?? null,
            type,
            amount
        })
    },

    async RegisterUser(user: User, dontRegister?: boolean): Promise<FloConomyUserData> {
        const userData = this._createDefaultUserData(user.id)

        if (!user.bot && dontRegister !== true) {
            await Database.Insert("users", {
                user_id: userData.user_id,
                cash: userData.cash.toString(),
                bank: userData.bank.toString()
            })
            console.log(`> registered user ${user.username}`)
        }

        return userData
    },

    _createDefaultUserData(userId: string): FloConomyUserData {
        return {
            user_id: userId,
            job: "Unemployed",
            cash: 0n,
            bank: 0n
        }
    }
}
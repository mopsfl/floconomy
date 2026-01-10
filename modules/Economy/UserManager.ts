import { User } from "discord.js";
import Database from "../Database/Database";
import { FloConomyUserData, BalanceKey, TransactionType, USER_DEFAULTS, TransactionOrigin, Transaction } from "./Types";
import { PoolConnection } from "mariadb/*";

export default {
    async GetUserData(user: User, dontRegister?: boolean): Promise<FloConomyUserData> {
        const response = await Database.GetTable<FloConomyUserData>("users", {
            user_id: user.id
        })

        if (!response.success) {
            if (response.error.code === "notFound") {
                return await this.RegisterUser(user, dontRegister)
            }
            console.error(response.error)
            throw new Error("unable to receive user data from database")
        }

        return {
            user_id: user.id,
            ...response.data
        } as FloConomyUserData
    },

    async GetUserTransactions(user: User) {
        const response = await Database.GetTable(
            "transactions",
            { user_id: user.id },
            false,
            10,
            true,
            false
        )

        if (!response.success) {
            if (response.error.code === "notFound") {
                throw new Error("You don't have any transactions yet!")
            }

            console.error(response.error)
            throw new Error("unable to receive transactions data from database")
        }

        return response.data as Transaction[]
    },

    async ModifyBalance(user: User, key: BalanceKey, amount: bigint, transConn?: PoolConnection): Promise<[FloConomyUserData, bigint]> {
        const userData = await this.GetUserData(user)
        const newValue = BigInt(userData[key]) + amount
        if (newValue < 0n) {
            console.error(`${key} cannot go below 0`)
            return
        }

        const response = await Database.Update(
            "users",
            { [key]: newValue.toString() },
            { user_id: user.id },
            transConn
        )

        if (!response.success) {
            throw new Error(response.error.sqlMessage)
        }

        userData[key] = newValue

        return [userData, BigInt(amount)]
    },

    async SetValue<K extends keyof FloConomyUserData>(user: User, key: K, value: FloConomyUserData[K]) {
        const response = await Database.Update(
            "users",
            { [key]: value },
            { user_id: user.id }
        )

        if (!response.success) {
            throw new Error(response.error.sqlMessage)
        }
    },

    async Deposit(user: User, amount: bigint) {
        if (amount <= 0n) throw new Error("Invalid amount")

        await Database.Transaction(async (conn) => {
            await this.ModifyBalance(user, "bank", amount, conn)
            await this.ModifyBalance(user, "cash", -amount, conn)

            await this.LogTransaction(user.id, amount, "deposit")
        }).catch(err => { throw err })
    },

    async Withdraw(user: User, amount: bigint) {
        if (amount <= 0n) throw new Error("Invalid amount")

        await Database.Transaction(async (conn) => {
            await this.ModifyBalance(user, "bank", -amount, conn)
            await this.ModifyBalance(user, "cash", amount, conn)

            await this.LogTransaction(user.id, amount, "withdraw")
        }).catch(err => { throw err })
    },

    async LogTransaction(userId: string, amount: bigint, type: TransactionType, origin: TransactionOrigin = "other", targetId?: string) {
        await Database.Insert("transactions", {
            user_id: userId,
            target_id: targetId ?? null,
            origin: origin,
            type,
            amount,
            created_at: new Date()
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
            bank: 0n,
            last_worked: null,
        }
    }
}
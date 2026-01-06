import { User } from "discord.js";
import Database from "../Database/Database";
import { FloConemyUserData, FloConemyUserDataRaw, FloConemyValue } from "./Types";

export default {
    async GetUserData(user: User, dontRegister?: boolean): Promise<FloConemyUserData> {
        const response = await Database.GetTable<FloConemyUserDataRaw>("users", {
            id: user.id
        })

        if (!response.success) {
            if (response.error.code === "notFound") {
                const userData = await this.RegisterUser(user, dontRegister)

                return this.ParseUserData(userData)
            }

            throw new Error("unable to receive user data from database")
        }

        return this.ParseUserData(response.data)
    },

    async IncrementValue(user: User, name: FloConemyValue, value: number): Promise<[FloConemyUserData, number]> {
        const userData: FloConemyUserData = await this.GetUserData(user)

        userData[name] += value

        const response = await Database.Update("users", {
            [name]: userData[name]
        }, { id: user.id })

        if (!response.success) {
            throw new Error(response.error.sqlMessage)
        }

        return [userData, value]
    },

    async SetValue(user: User, name: FloConemyValue, value: number): Promise<[FloConemyUserData, number]> {
        const userData: FloConemyUserData = await this.GetUserData(user)

        userData[name] = value

        const response = await Database.Update("users", {
            [name]: userData[name]
        }, { id: user.id })

        if (!response.success) {
            throw new Error(response.error.sqlMessage)
        }

        return [userData, value]
    },

    ParseUserData(userData: FloConemyUserData) {
        return {
            id: userData.id,
            cash: Number(userData.cash),
            bank: Number(userData.bank),
        }
    },

    async RegisterUser(user: User, dontRegister?: boolean): Promise<FloConemyUserDataRaw> {
        const userData: FloConemyUserDataRaw = {
            id: user.id,
            cash: "0",
            bank: "0"
        }

        if (!user.bot && dontRegister !== true) {
            await Database.Insert("users", userData)
            console.log(`> registered user ${user.username}`)
        }

        return userData
    }
}
export default class User {
    /**
     * The auto increment value associated with the user
     */
    private id: number;

    /**
     * The discord Id associated with the user
     */
    private discordId: number;

    /**
     * The user's username at the time of sending the message
     */
    private userName: string;

    /**
     * User's current money, users start with 100$
     */
    private money;

    public constructor(id: number, discordId: number, userName: string, money: number) {
        this.id = id;
        this.discordId = discordId;
        this.userName = userName
        this.money = money;
    }

    public getId() {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;

        return this;
    }

    public getDiscordId() {
        return this.discordId;
    }

    public setDiscordId(discordId: number) {
        this.discordId = discordId;

        return this;
    }

    public getUsername() {
        return this.userName;
    }

    public setUsername(userName: string) {
        this.userName = userName;

        return this;
    }

    public getMoney() {
        return this.money;
    }

    public setMoney(money: number) {
        this.money = money;

        return this;
    }
}
export default class UserBet {
    /**
     * Id of row
     */
    private id: number;

    /**
     * Id of user who owns bet
     */
    private userId: number;

    /**
     * Id of bet the user bet relates to
     */
    private betId: number;

    /**
     * Id of the option the user bets relates to
     */
    private optionId: number;

    /**
     * money user has placed on bet
     */
    private money: number;

    /**
     * The totol amount of money the user made, includes initial amount they bet
     */
    private winnings = 0;

    /**
     * Related user's username
     */
    private username: string = '';

    public constructor(id: number, userId: number, betId: number, optionId: number, money: number) {
        this.id = id;
        this.userId = userId;
        this.betId = betId;
        this.optionId = optionId;
        this.money = money;
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;

        return this;
    }

    public getUserId(): number {
        return this.userId;
    }

    public setUserId(userId: number) {
        this.userId = userId;

        return this;
    }

    public getBetId(): number {
        return this.betId;
    }

    public setBetId(betId: number) {
        this.betId = betId;

        return this;
    }

    public getOptionId(): number {
        return this.optionId;
    }

    public setOptionId(optionId: number) {
        this.optionId = optionId;

        return this;
    }

    public getMoney(): number {
        return this.money;
    }

    public setMoney(money: number) {
        this.money = money;

        return this;
    }

    public getWinnings(): number {
        return this.winnings;
    }

    public setWinnings(winnings: number) {
        this.winnings = winnings;

        return this;
    }

    public getUsername(): string {
        return this.username;
    }

    public setUsername(username: string) {
        this.username = username;

        return this;
    }
}
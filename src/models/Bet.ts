import Option from "./Option";

export default class Bet {
    /**
     * Bet description
     */
    private description: string;

    /**
     * Bet id
     */
    private id: number;

    /**
     * Id of the user who created the bet
     */
    private userId: number;

    /**
     * Username of user who created the bet
     */
    private author: string = '';

    /**
     * array of options related to the bet
     */
    private options: Option[]

    public constructor(id: number, description: string, options: Option[], userId: number) {
        this.id = id;
        this.description = description;
        this.options = options;
        this.userId = userId;
    }

    public getDescription() {
        return this.description;
    }

    public setDescription(description: string) {
        this.description = description;

        return this;
    }

    public getId() {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;

        return this;
    }

    public setOptions(options: Option[]) {
        this.options = options;

        return this;
    }

    public getOptions() {
        return this.options;
    }

    public setAuthor(author: string) {
        this.author = author;

        return this;
    }

    public getAuthor() {
        return this.author;
    }

    public getUserId() {
        return this.userId;
    }

    public setUserId(userId: number) {
        this.userId = userId;

        return this;
    }
}
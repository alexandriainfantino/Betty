export default class Option {

    /**
     * option description
     */
    private description: string;

    /**
     * id of the option
     */
    private id: number;

    public constructor(id: number, description: string) {
        this.description = description;
        this.id = id;
    }

    public getId() {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;

        return this;
    }

    public getDescription() {
        return this.description;
    }

    public setDescription(description: string) {
        this.description = description;

        return this;
    }
}
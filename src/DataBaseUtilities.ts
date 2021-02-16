import mysql from "mysql";
import Bet from "./models/Bet";
import Option from "./models/Option";
import User from "./models/User";

export default class DataBaseUtilities {
    public async getOpenBets(): Promise<Bet[]> {
            const db = this.getDbConnection();
            let statement = "SELECT * FROM bet WHERE active = 1";
            let bets: [] = await new Promise((resolve, reject) => {
                db.query(statement, function (err, result, fields) {
                    resolve(result);
                });
            });

            let openBets: Bet[] = [];
            for (const bet of bets) {
                const formattedBet = new Bet(bet['id'], bet['description'], [], bet['userId']);
                openBets.push(formattedBet);
            }

            return openBets;
    }

    public async fillBetOptions(bets: Bet[]): Promise<Bet[]> {
        const db = this.getDbConnection();
        let statment = "SELECT * FROM `option` WHERE betId = ?";
        for (const bet of bets) {
            let inserts = [bet.getId()];
            let boundStatement = mysql.format(statment, inserts);
            let options: [] = await new Promise((resolve, reject) => {
                db.query(boundStatement, function (err, result, fields) {
                    resolve(result);
                });
            });

            let optionObjects: Option[] = [];
            for (const option of options) {
                const optionObject: Option = new Option(option['id'], option['description']);
                optionObjects.push(optionObject);
            }

            bet.setOptions(optionObjects);
        }

        return bets;
    }

    public async fillBetAuthors(bets: Bet[]): Promise<Bet[]> {
        const db = this.getDbConnection();
        let statment = "SELECT username FROM user WHERE id = ? LIMIT 1";
        for (const bet of bets) {
            const inserts = [bet.getUserId()];
            let username: string = await new Promise((resolve, reject) => {
                statment = mysql.format(statment, inserts);
                db.query(statment, function (err, result, fields) {
                    resolve(result[0].username);
                });
            });
            bet.setAuthor(username);
        }

        return bets;
    }

    public createBet(description: string, user: User): Promise<Bet> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "INSERT INTO bet (description, active, userId) VALUES (?, 1, ?)";
            const inserts = [description, user.getId()];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                resolve(new Bet(result.insertId, description, [], user.getId()));
            });
        })
    }

    public async createOptions(descriptions: string[], bet: Bet): Promise<Bet> {
        const db = this.getDbConnection();
        let statment = "INSERT INTO `option` (description, betId) VALUES (?, ?)";
        let options: Option[] = [];
        for (const description of descriptions) {
            let option: Option = await new Promise((resolve, reject) => {
                const inserts = [description, bet.getId()];
                statment = mysql.format(statment, inserts);
                db.query(statment, function (err, result, fields) {
                    resolve(new Option(result.insertId, description));
                });
            });

            options.push(option);
        }
        bet = bet.setOptions(options)

        return bet;
    }

    public async handleUser(author: any): Promise<User> {
        let user = await this.getUser(author.id);
        if (user === null) {
            user = await this.createUser(author)
        }

        return user;
    }

    private getUser(discordId: number): Promise<User|null> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statement = "SELECT * FROM user WHERE discordId = ? LIMIT 1";
            const inserts = [discordId];
            statement = mysql.format(statement, inserts);
            db.query(statement, function (err, result, fields) {
                if (result.length === 0) {
                    resolve(null);
                } else {
                    result = result[0];
                    resolve(new User(result['id'], result['discordId'], result['username'], result['money']));
                }
            });
        });
    }

    private createUser(author: any): Promise<User> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "INSERT INTO user (discordId, username) VALUES (?,?)";
            const inserts = [author.id, author.username];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                resolve(new User(result.insertId, author.id, author.username, 100));
            });
        });
    }

    private getDbConnection(): any {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "betty"
        });

        con.connect(function(err) {
            if (err) throw err;
            console.log("Connected!");
        });

        return con;
    }
}
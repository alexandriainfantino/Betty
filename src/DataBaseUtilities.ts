import mysql from "mysql";
import Bet from "./models/Bet";
import Option from "./models/Option";
import User from "./models/User";
import UserBet from "./models/UserBet";

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
                let boundStatement = mysql.format(statment, inserts);
                db.query(boundStatement, function (err, result, fields) {
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

    public placeBet(user: User, betId: number, optionId: number, amount: number): Promise<string|boolean> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "INSERT INTO userBet (userId, betId, optionId, money) VALUES (?,?,?,?)";
            const inserts = [user.getId(), betId, optionId, amount];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                if (!err) {
                    resolve(true);

                    return;
                }
                resolve(err.message);
            });
        });
    }

    public getBet(betId: number): Promise<Bet> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "SELECT * FROM bet WHERE id = ? LIMIT 1";
            const inserts = [betId];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                result = result[0]
                resolve(new Bet(betId, result['description'], [], result['userId']));
            });
        });
    }

    public getOption(optionId: number): Promise<Option> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "SELECT * FROM `option` WHERE id = ? LIMIT 1";
            const inserts = [optionId];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                result = result[0];
                resolve(new Option(optionId, result['description']));
            });
        });
    }

    public betOptionExists(betId: number, optionId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "SELECT 1 FROM `option` JOIN bet ON bet.id = `option`.betId WHERE betId = ? AND `option`.id = ? AND active = 1";
            const inserts = [betId, optionId];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                resolve(result.length > 0);
            });
        });
    }

    public betOptionExistsForUser(betId: number, userId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "SELECT 1 FROM userBet WHERE betId = ? AND userId = ?";
            const inserts = [betId, userId];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                resolve(result.length > 0);
            });
        });
    }

    public async getUserBets(betId: number): Promise<UserBet[]> {
        const db = this.getDbConnection();
        let statment = "SELECT * FROM userBet WHERE betId = ?";

        let userBets: UserBet[] = await new Promise((resolve, reject) => {
            const inserts = [betId];
            let boundStatement = mysql.format(statment, inserts);
            db.query(boundStatement, function (err, result, fields) {
                resolve(result);
            });
        });

        let userBetObjects: UserBet[] = [];
        for (const userBet of userBets) {
            const userBetObject = new UserBet(userBet['id'], userBet['userId'], userBet['betId'], userBet['optionId'], userBet['money'])
            userBetObjects.push(userBetObject);
        }

        return userBetObjects;
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

    public getUserByUserId(userId: number): Promise<User> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statement = "SELECT * FROM user WHERE id = ? LIMIT 1";
            const inserts = [userId];
            statement = mysql.format(statement, inserts);
            db.query(statement, function (err, result, fields) {
                result = result[0];
                resolve(new User(result['id'], result['discordId'], result['username'], result['money']));
            });
        });
    }

    public closeBet(betId: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statement = "UPDATE bet SET active = 0 WHERE id = ?";
            const inserts = [betId];
            statement = mysql.format(statement, inserts);
            db.query(statement, function (err, result, fields) {
                resolve(result);
            });
        });
    }

    public async updateUserBets(userBets: UserBet[]): Promise<void> {
        const db = this.getDbConnection();
        let statment = "UPDATE userBet SET winnings = ? WHERE id = ?";
        for (const userBet of userBets) {
            await new Promise((resolve, reject) => {
                const inserts = [userBet.getWinnings(), userBet.getId()];
                let boundStatement = mysql.format(statment, inserts);
                db.query(boundStatement, function (err, result, fields) {
                    resolve(result);
                });
            });
        }
        return;
    }

    public async addUserWinningsToMoney(userBets: UserBet[]): Promise<void> {
        const db = this.getDbConnection();
        let statment = "UPDATE user SET money = money + ? WHERE id = ?";
        for (const userBet of userBets) {
            await new Promise((resolve, reject) => {
                const inserts = [userBet.getWinnings(), userBet.getUserId()];
                let boundStatement = mysql.format(statment, inserts);
                db.query(boundStatement, function (err, result, fields) {
                    resolve(result);
                });
            });
        }
        return;
    }

    public updateUserMoney(userId: number, money: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statement = "UPDATE user SET money = money + ? WHERE id = ?";
            const inserts = [money, userId];
            statement = mysql.format(statement, inserts);
            db.query(statement, function (err, result, fields) {
                resolve(result);
            });
        });
    }

    public async getUsers(): Promise<User[]> {
        const db = this.getDbConnection();
        let statment = "SELECT * FROM user ORDER BY money DESC";

        let users: User[] = await new Promise((resolve, reject) => {
            db.query(statment, function (err, result, fields) {
                resolve(result);
            });
        });

        let userObjects: User[] = [];
        for (const user of users) {
            const userObject = new User(user['id'], user['discordId'], user['username'], user['money'])
            userObjects.push(userObject);
        }

        return userObjects;
    }

    public async getUserInfo(users: User[]): Promise<User[]> {
        const db = this.getDbConnection();
        let statment = "SELECT * FROM userBet WHERE userId = ?";
        let userInfoArray: any = [];
        for (const user of users) {
            const userBets: UserBet[] = await new Promise((resolve, reject) => {
                const inserts = [user.getId()];
                let boundStatement = mysql.format(statment, inserts);
                db.query(boundStatement, function (err, result, fields) {
                    resolve(result);
                });
            });

            const userBetObjects: UserBet[] = [];
            for (const userBet of userBets) {
                const userBetObject = new UserBet(userBet['id'], userBet['userId'], userBet['betId'], userBet['optionId'], userBet['money']);
                userBetObject.setWinnings(userBet['winnings']);
                userBetObjects.push(userBetObject);
            }

            const infoTuple = [user, userBetObjects];
            userInfoArray.push(infoTuple);
        }

        return userInfoArray;
    }

    private createUser(author: any): Promise<User> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            let statment = "INSERT INTO user (discordId, username) VALUES (?,?)";
            const inserts = [author.id, author.username];
            statment = mysql.format(statment, inserts);
            db.query(statment, function (err, result, fields) {
                resolve(new User(result.insertId, author.id, author.username, 1000));
            });
        });
    }

    private getDbConnection(): any {
        var con = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: process.env.DATABASE_PASSWORD,
            database: "betty"
        });

        con.connect(function(err) {
            if (err) throw err;
        });

        return con;
    }
}
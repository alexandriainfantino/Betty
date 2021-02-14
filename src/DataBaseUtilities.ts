export default class DataBaseUtilities {
    public getOpenBets(): Promise<any> {
        return new Promise((resolve, reject) => {
            const db = this.getDbConnection();
            db.query("SELECT * FROM bet WHERE active = 1", function (err, result, fields) {
                 resolve(result);
            });
        })
    }

    public createBet(description: string) {
        //TODO
        // return new Promise((resolve, reject) => {
        //     const db = this.getDbConnection();
        //     db.query("INSERT INTO bet (description, active) VALUES (?, 1)", function (err, result, fields) {
        //         resolve(result);
        //     });
        // })
    }

    public createOptions(descriptions: []) {

    }

    private getDbConnection(): any {
        const mysql = require('mysql');
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
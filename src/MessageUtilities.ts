import Bet from "./models/Bet";
import User from "./models/User";
import UserBet from "./models/UserBet";

export default class MessageUtilities {
    public getOpenBetsResponse(bets: Bet[]): string {
        let response = `No active bets.`;
        if (bets.length !== 0) {
            response = `Here are all the open bets:\n-----------------------------\n`
            for (const bet of bets) {
                response = response + `\`\`\``
                response = response + this.formatBetResponse(bet);
                response = response + `\`\`\``
                response = response + `\n------------------------------\n`
            }
        }

        return response;
    }

    public getCreateBetResponse(bet: Bet, user: User): string {
        // TODO: fix this so I don't need weird spacing
        let response = `Your bet has been created:
            \`\`\`\nBet ID: ${bet.getId()}\nBet Description: ${bet.getDescription()}\nBet Author: ${user.getUsername()}\n--------------------------------------\nOPTIONS: \n`

        let optionText = ``;
        for (const option of bet.getOptions()) {
            optionText = optionText + `option ID: ${option.getId()} - ${option.getDescription()} \n`
        }


        return response + optionText + `\`\`\``;
    }

    public getCloseBetResponse(userBets: UserBet[], bet: Bet, moneyPool: number): string {
        let response = `Here's the outcome of bet: ${bet.getDescription()} \n TOTAL POT: ${moneyPool}$ \n ------------------------\n`
        let winnersString = `WINNERS: \n`;
        let losersString = `LOSERS: \n`
        for (const userBet of userBets) {
            if (userBet.getWinnings() > 0) {
                winnersString = winnersString + `${userBet.getUsername()}: + ${userBet.getWinnings()}$ \n`
            } else {
                losersString = losersString + `${userBet.getUsername()}: -${userBet.getMoney()}$ \n`
            }
        }
        response = response + winnersString + losersString;

        return response;
    }

    public getStandingsResponse(userInfoArray: any): string {
        let response = `CURRENT STANDINGS: \n ----------------------\n`
        let place = 1;
        for (const userInfo of userInfoArray) {
            const user = userInfo[0];
            const betInfo = userInfo[1];
            let wins = 0;
            let losses = 0;
            let outstanding = 0;
            for (const bet of betInfo) {
                if (bet.getWinnings() > 0) {
                    wins++;
                } else if (bet.getWinnings < 0) {
                    losses ++;
                } else {
                    outstanding++;
                }
            }
            response = response + `${place}. ${user.getUsername()} ${user.getMoney()}$ - wins: ${wins} losses: ${losses} outstanding bets: ${outstanding} \n`
            place++;
        }

        return response;
    }

    private formatBetResponse(bet: Bet) {
        let response = `Bet ID: ${bet.getId()}\nBet Description: ${bet.getDescription()}\nBet Author: ${bet.getAuthor()}\nOPTIONS: \n`

        for (const option of bet.getOptions()) {
            const optionText = `option ID: ${option.getId()} - ${option.getDescription()} \n`
            response = response + optionText;
        }

        return response;
    }
}
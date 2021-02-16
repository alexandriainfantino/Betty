import Bet from "./models/Bet";
import User from "./models/User";

export default class MessageUtilities {
    public getOpenBetsResponse(bets: Bet[]): string {
        let response = `No active bets.`;
        if (bets.length !== 0) {
            response = `Here are all the open bets:\n-----------------------------\n`
            for (const bet of bets) {
                console.log(bet);
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


        return response + optionText;
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
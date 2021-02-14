export default class MessageUtilities {
    public getOpenBetsResponse(bets: []): string {
        let response = `No active bets.`;
        if (bets.length !== 0) {
            response = `Here are all the open bets:
                ${bets}`
        }

        return response;
    }
}
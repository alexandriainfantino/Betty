import * as dotenv from "dotenv"
import * as Discord from "discord.js"
import DataBaseUtilities from "./DataBaseUtilities";
import MessageUtilities from "./MessageUtilities";

dotenv.config();
const client = new Discord.Client();

const databaseUtilities = new DataBaseUtilities();
const messageUtilities = new MessageUtilities();

client.on('message', async (message: any) => {
    if (!message.author.bot) {
        const user = await databaseUtilities.handleUser(message.author);
        const commandString = message.content;
        const commandArray = commandString.split(" ");
        const command = commandArray[0];
        const channelId = message.channel.id;
        const channel = client.channels.cache.get(channelId as string) as Discord.TextChannel;

        switch (command.toLowerCase()) {
            case "-commands":
                await channel.send(`
                    Here are your options:
                    \`\`\`
                    - OpenBets
                    - CreateBet "<Bet description>" ["<optionA>", "<optionB>", ....]
                    - Bet <betId> <optionId> <amount>
                    - CloseBet <betId> <winningOptionId>
                    - Money
                    \`\`\`
                `);
                break;
            case "-openbets":
                const betsWithoutOptions = await databaseUtilities.getOpenBets();
                let bets = await databaseUtilities.fillBetOptions(betsWithoutOptions);
                bets = await databaseUtilities.fillBetAuthors(bets);
                let response = messageUtilities.getOpenBetsResponse(bets)
                await channel.send(response);

                break;
            case "-createbet":
                let betDescription = commandString.split('"');
                betDescription = betDescription[1];
                let betOptions = commandString.match(/\[(.*?)\]/);
                betOptions = betOptions[1].replace(/['"]+/g, '')
                betOptions = betOptions.split(",")
                let bet = await databaseUtilities.createBet(betDescription, user);
                bet = await databaseUtilities.createOptions(betOptions, bet)
                let createResponse = messageUtilities.getCreateBetResponse(bet, user);

                await channel.send(createResponse);
                break;
            case "-bet":
                await channel.send(`
                    Your bet has been placed:
                    WIP
                `);
                break;
            case "-closebet":
                await channel.send(`
                    Your bet has been closed, payouts:
                    WIP
                `);
                break;
            case "-money":
                await channel.send(`
                    ${user.getUsername()}'s current standings: ${user.getMoney()}$
                `);
                break;

        }
    }
});

client.login("");
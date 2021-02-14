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
                const bets = await databaseUtilities.getOpenBets();
                let response = messageUtilities.getOpenBetsResponse(bets)
                await channel.send(response);

                break;
            case "-createbet":
                const betDescription = message[1];
                const betOptions = message[2];


                await channel.send(`
                    Your bet has been created:
                    WIP
                `);
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
                    Your current standings:
                    WIP
                `);
                break;

        }
    }
});

client.login("");
import * as dotenv from "dotenv"
import * as Discord from "discord.js"
import DataBaseUtilities from "./DataBaseUtilities";
import MessageUtilities from "./MessageUtilities";
import UserBet from "./models/UserBet";

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
                    - Standings
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
                const betId = commandArray[1];
                const optionId = commandArray[2];
                const amount = commandArray[3];
                if (amount <= 0) {
                    await channel.send(`You can not bet ${amount}, you can only bet positive amounts.`);

                    break;
                }
                if (user.getMoney() < amount) {
                    await channel.send(`You can not bet ${amount}, you only have ${user.getMoney()}`);

                    break;
                }
                if (!await databaseUtilities.betOptionExists(betId, optionId)) {
                    await channel.send(`Bet ID: ${betId} and Option ID: ${optionId} is not a open, valid bet. Check open bets with the -openBets command`);

                    break;
                }
                if (await databaseUtilities.betOptionExistsForUser(betId, user.getId())) {
                    await channel.send(`You already have a bet on bet ID: ${betId}`);

                    break;
                }
                const result = await databaseUtilities.placeBet(user, betId, optionId, amount);
                await databaseUtilities.updateUserMoney(user.getId(), -amount);

                if (result !== true) {
                    await channel.send(`ERROR PLACING BET: ${result}`);

                    break
                }
                const requestedBet = await databaseUtilities.getBet(betId);
                const requestedOption = await databaseUtilities.getOption(optionId);

                await channel.send(`
                    Your bet has been placed: ${amount}$ on ${requestedBet.getDescription()} for ${requestedOption.getDescription()}
                `);
                break;
            case "-closebet":
                const betToCloseId = commandArray[1];
                const winningOptionId = commandArray[2];
                const betToClose = await databaseUtilities.getBet(betToCloseId);
                const winningOption = await databaseUtilities.getOption(winningOptionId);
                if (betToClose.getUserId() !== user.getId()) {
                    await channel.send(`You do not have the permission to close the bet: ${betToClose.getDescription()}`);

                    break
                }
                if (!await databaseUtilities.betOptionExists(betToCloseId, winningOptionId)) {
                    await channel.send(`${winningOption.getDescription()} is not a valid winning option for ${betToClose.getDescription()}`);
                }
                const userBets = await databaseUtilities.getUserBets(betToCloseId);
                let moneyPool = 0;
                let winningBetPool = 0;
                for (const userBet of userBets) {
                    const userObject = await databaseUtilities.getUserByUserId(userBet.getUserId());
                    userBet.setUsername(userObject.getUsername());
                    moneyPool = moneyPool + userBet.getMoney();
                    if (userBet.getOptionId() == winningOptionId) {
                        winningBetPool = winningBetPool + userBet.getMoney();
                    }
                }

                for (const userBet of userBets) {
                    if (userBet.getOptionId() == winningOptionId) {
                        const percentWinnings = userBet.getMoney() / winningBetPool;
                        userBet.setWinnings(percentWinnings * moneyPool);
                    } else {
                        userBet.setWinnings(-userBet.getMoney());
                    }
                }

                await databaseUtilities.closeBet(betToCloseId);
                await databaseUtilities.updateUserBets(userBets);
                await databaseUtilities.addUserWinningsToMoney(userBets);
                const closeBetResponse = messageUtilities.getCloseBetResponse(userBets, betToClose, moneyPool);

                await channel.send(closeBetResponse);
                break;
            case "-money":
                await channel.send(`
                    ${user.getUsername()}'s current standings: ${user.getMoney()}$
                `);
                break;
            case "-standings":
                let users = await databaseUtilities.getUsers();
                let userInfo = await databaseUtilities.getUserInfo(users);
                const standingsResponse = messageUtilities.getStandingsResponse(userInfo);
                await channel.send(standingsResponse);

        }
    }
});

client.login("");
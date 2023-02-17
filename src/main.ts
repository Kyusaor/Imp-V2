import { Client, Guild, TextBasedChannel, User } from "discord.js";
import { Config } from "../data/config.js";
import { Constants } from "./core/models/constants.js";
import { Methods } from "./core/models/methods.js";

import { BotText } from "./core/text/botText.js";
import { Utils } from "./core/utils.js";


//Var initialization
let kyu:User
let ImpServer:Guild;
let errorsChannel: TextBasedChannel;

let bot = new Client(Config.clientParam);
bot.login(Config.token);


//Executed at boot
bot.on('ready', async () => {
    kyu = await bot.users.fetch(Constants.kyu);
    ImpServer = await bot.guilds.fetch(Constants.ImpServerId);
    errorsChannel = await bot.channels.fetch(Constants.channelsId.ERRORS_LOGS) as TextBasedChannel;
    console.log(Utils.displayConsoleHour() + bot.user?.username + BotText.console.READY);
});

//Script execution

bot.on('interactionCreate', async intera => {
    try {
        if(intera.isChatInputCommand()) Methods.commandInteractionHandler(intera);
    }
    catch (error) {
        await sendErrorLog(error);
    }
});

async function sendErrorLog(error: unknown) {
    console.log(error);
    if (error instanceof Error && error.stack)
        await errorsChannel.send(error.stack.toString()).catch(e => console.log("erreur lors de l'envoi"));
}

export { bot, ImpServer };
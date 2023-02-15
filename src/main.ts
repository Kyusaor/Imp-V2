import { Client, Guild, User } from "discord.js";
import { Config } from "../data/config.js";
import { Constants } from "./core/models/constants.js";
import { Methods } from "./core/models/methods.js";

import { BotText } from "./core/text/botText.js";
import { Utils } from "./core/utils.js";


//Var initialization
let kyu:User
let ImpServer:Guild;

let bot = new Client(Config.clientParam);
bot.login(Config.token);


//Executed at boot
bot.on('ready', async () => {
    kyu = await bot.users.fetch(Constants.kyu);
    ImpServer = await bot.guilds.fetch(Constants.ImpServerId);
    console.log(Utils.displayConsoleHour() + bot.user?.username + BotText.console.READY);
});

//Script execution

bot.on('interactionCreate', async intera => {

    if(intera.isChatInputCommand()) Methods.commandInteractionHandler(intera);
});


export { bot, ImpServer };
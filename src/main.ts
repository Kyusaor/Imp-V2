import { Client } from "discord.js";
import { Config } from "../data/config.js";

import { BotText } from "./core/text/botText.js";

let bot = new Client(Config.clientParam);
bot.login(Config.token);


//Var initialization
let kyu;

//Executed at boot
bot.on('ready', async () => {
    kyu = await bot.users.fetch(Config.kyu);
    console.log(bot.user?.username + BotText.console.READY);
})
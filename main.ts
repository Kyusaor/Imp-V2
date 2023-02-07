import { Client } from "discord.js";
import Config from "./data/config";

let bot = new Client(Config.clientParam);

bot.login(Config.token);


//Executed at boot
bot.on('ready', () => {
    console.log('test')
})
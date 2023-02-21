import { Client, Guild, InteractionType, TextBasedChannel, User } from "discord.js";
import { Config } from "../data/config.js";
import { Constants } from "./core/models/constants.js";
import { Methods } from "./core/models/methods.js";

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
    console.log(Utils.displayDate(new Date(), "console") + bot.user?.username + Constants.text.console.READY);
});



//Script execution
bot.on('interactionCreate', async intera => {
    try {
        switch(intera.type) {
            case InteractionType.ApplicationCommand:
                await Methods.commandInteractionHandler(intera);
                break;

            case InteractionType.ModalSubmit:
                await Methods.modalSubmitManager(intera);
                break;
            
            case InteractionType.MessageComponent:
                if(intera.isAnySelectMenu()) await Methods.selectMenuInteractionHandler(intera);
                if(intera.isButton()) await Methods.buttonHandler(intera);
                break;
            }
        
    }
    catch (error) {
        await sendErrorLog(error);
    }
});


bot.on('guildMemberAdd', async member => {
    if(member.guild.id !== Constants.ImpServerId) return;
    try {
        await Methods.newMemberHandler(member);
    }
    catch (error) {
        await sendErrorLog(error);
    }
})



//Utils functions
async function sendErrorLog(error: unknown) {
    console.log(error);
    if (error instanceof Error && error.stack)
        await errorsChannel.send(error.stack.toString()).catch(e => console.log("erreur lors de l'envoi"));
}

export { bot, ImpServer };
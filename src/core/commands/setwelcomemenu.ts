import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder, TextBasedChannel } from "discord.js";
import { ImpServer, bot } from "../../main.js";
import { Constants } from "../models/constants.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName(`setwelcomemenu`)
    .setDescription(`Redéfinit le panneau d'accueil`)
    .setDefaultMemberPermissions(0)

export async function run () {

    let r4list = await ImpServer.members.cache
    .filter(m => m.roles.cache.map(m=> m.name).includes("R4"))
    .map(m => m.nickname || m.user.username)

    let welcomeMenuBuild = constructMenu(r4list);

    let welcomeChannel = await bot.channels.fetch(Constants.channelsId.VALIDATION_CHANNEL) as TextBasedChannel;
    welcomeChannel.send({components: [welcomeMenuBuild]});

}


function constructMenu (r4list: string[]) {

    let menu = new StringSelectMenuBuilder()
        .setCustomId(`r4-select`)
        .setPlaceholder("*Aucune option sélectionnée*")

    for(let r4 in r4list){
        menu.addOptions({
            label: r4,
            description: "",
            value: r4,
        })
    }

    let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    return row;
}
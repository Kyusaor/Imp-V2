import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { ImpServer } from "../../main.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName(`setwelcomemenu`)
    .setDescription(`Redéfinit le panneau d'accueil`)
    .setDefaultMemberPermissions(0)

export async function run () {

    let r4list = await ImpServer.members.cache
    .filter(m => m.roles.cache.map(m=> m.name).includes("R4"))
    .map(m => m.nickname || m.user.username)

}


async function constrct() {

    //Select menu builder
    let row = new ActionRowBuilder().addComponents(

        new StringSelectMenuBuilder()
            .setCustomId(`r4-select`)
            .setPlaceholder("*Aucune option sélectionnée*")
            .addOptions(

            )
    )
}
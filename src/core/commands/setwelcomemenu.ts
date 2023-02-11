import { ActionRowBuilder, SlashCommandBuilder, StringSelectMenuBuilder } from "discord.js";
import { ImpServer } from "../../main.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName(`setwelcomemenu`)
    .setDescription(`Redéfinit le panneau d'accueil`)

export abstract class setWelcomeMenu {

    static async constrct() {


        //R4 fetching
        let r4list = await ImpServer.members

        //Select menu builder
        let row = new ActionRowBuilder().addComponents(

            new StringSelectMenuBuilder()
                .setCustomId(`r4-select`)
                .setPlaceholder("*Aucune option sélectionnée*")
                .addOptions(

                )
        )
    }


}
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName("setautorole")
    .setDescription("Redéfinis le panneau d'auto-rôle")
    .setDefaultMemberPermissions(0)

export async function run(intera:CommandInteraction) {
    
}
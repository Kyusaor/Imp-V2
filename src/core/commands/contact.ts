import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { contactSheet } from "./annuaire.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName(`contact`)
    .setDescription(`Affiche le numéro d'un membre grâce à son pseudo ou son discord`)
    .addStringOption(opt => opt
        .setName(`pseudo`)
        .setDescription(`Pour chercher avec le pseudo`)
        .setAutocomplete(true)
    )
    .addUserOption(opt => opt
        .setName(`discord`)
        .setDescription(`Pour chercher avec le profil discord`)
    )


export async function autocompleteManager(intera:AutocompleteInteraction, db:contactSheet[]) {
    const focusOpt = intera.options.getFocused().toLowerCase();
    let choices = db.map(e => e.pseudo.toLowerCase())
        .filter(e => e.includes(focusOpt))
        .map(e => ({name: e, value: e}))

    if(choices.length > 25) choices = [{name: "Trop d'éléments, continuez d'écrire pour affiner la recherche", value: "error"}]
    await intera.respond(choices);
}
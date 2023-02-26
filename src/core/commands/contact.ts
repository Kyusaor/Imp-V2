import { 
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    InteractionReplyOptions,
    SlashCommandBuilder,
    User 
} from "discord.js";
import { readFileSync } from "fs";
import { Constants } from "../models/constants.js";
import { Utils } from "../utils.js";
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

export async function run(intera:ChatInputCommandInteraction) {
    const pseudo = intera.options.getString('pseudo');
    const discord = intera.options.getUser('discord');
    const db = JSON.parse(readFileSync('./data/contacts.json', 'utf-8')) as contactSheet[];
    
    if(pseudo && (pseudo == "error" || !db.map(e => e.pseudo).includes(pseudo)))
        return Utils.interaReply(Constants.text.contacts.memberNotFound, intera);

    let profiles = findContactElement(pseudo, discord, db);
    if(!Object.keys(profiles)) return Utils.interaReply(profiles as string, intera);
}

export async function autocompleteManager(intera:AutocompleteInteraction, db:contactSheet[]) {
    const focusOpt = intera.options.getFocused().toLowerCase();
    let choices = db.map(e => e.pseudo.toLowerCase())
        .filter(e => e.includes(focusOpt))
        .map(e => ({name: e, value: e}))

    if(choices.length > 25) choices = [{name: "Trop d'éléments, continuez d'écrire pour affiner la recherche", value: "error"}]
    await intera.respond(choices);
}

function findContactElement(pseudo:string | null, discord:User | null, db:contactSheet[]) {
    let output:contactSheet[] | string;
    if(!pseudo && discord) {
        let id = discord.id;
        output = db.filter(e => e.user == id);
        if(!output) output = "Aucune fiche contact correspondante";
    }
    else if(pseudo && !discord) {
        output = db.filter(e => e.pseudo == pseudo);
        if(!output) output = "Aucune fiche contact correspondante";
    }
    else {
        output = db.filter(e => (e.pseudo == pseudo) && (e.user == discord?.id));
        if(!output) output = "Cet utilisateur discord ne possède pas de compte enregistré avec ce pseudo sur l'annuaire";
    }

    return output;
}

function buildContactEmbed() {
    
    let embed = new EmbedBuilder()
}
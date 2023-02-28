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
import { Utils, contactSheet } from "../utils.js";

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
    if(typeof profiles == 'string') return Utils.interaReply(profiles as string, intera);

    let payload = buildContactEmbed(profiles);
    Utils.interaReply(payload, intera);
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
        if(output.length == 0) output = "Aucune fiche contact ne correspond à ce membre";
    }
    else if(pseudo && !discord) {
        output = db.filter(e => e.pseudo == pseudo);
        if(output.length == 0) output = "Aucune fiche contact correspondante à ce pseudo";
    }
    else {
        output = db.filter(e => (e.pseudo == pseudo) && (e.user == discord?.id));
        if(output.length == 0) output = "Cet utilisateur discord ne possède pas de compte enregistré avec ce pseudo sur l'annuaire";
    }

    return output;
}

function buildContactEmbed(data:contactSheet[]) {
    let payload:InteractionReplyOptions = {};

    let embed = new EmbedBuilder()
        .setTitle(`Fiche contact`)
        .setThumbnail(`https://discord.com/assets/5f8aee4f266854e41de9778beaf7abca.svg`)
        .setDescription(`En cas de souci, mentionnez <@${Constants.kyu}>`)
        .setFooter({text: `Pour copier le numéro, faites un appui long dessus`})

    switch(data.length) {
        case 0:
            payload.content = Constants.text.errors.errorFetchMember;
            break;

        case 1:
            let profile:contactSheet = data[0];
            embed.addFields(profile.createEmbedFields())
            payload = { embeds: [embed] }
            break;
        
        default:
            let embeds:EmbedBuilder[] = [];
            for(let profile of data) {
                let providedEmbed = new EmbedBuilder(embed.data);
                providedEmbed.setFields(profile.createEmbedFields());
                embeds.push(providedEmbed)
            }
            payload = {
                content: `Voilà les profils de <@${data[0].user}>`,
                embeds: embeds
            }
            break;
    }

    return payload;
}
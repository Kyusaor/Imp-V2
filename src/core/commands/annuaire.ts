import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, embedLength, SlashCommandBuilder } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { Constants } from "../models/constants.js";
import { Utils } from "../utils.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName('annuaire')
    .setDescription(`Gestion de l'annuaire de guilde`)
    .setDMPermission(false)
    .setDefaultMemberPermissions(0)
    .addSubcommand(sub => sub
        .setName(`create`)
        .setDescription(`Ajoute un élément à l'annuaire`)
        .addStringOption(opt => opt
            .setName(`pseudo`)
            .setDescription(`Le pseudo ingame`)
            .setRequired(true)
        )
        .addUserOption(opt => opt
            .setName(`discord`)
            .setDescription(`Le compte discord du membre`)
            .setRequired(true)
        )
        .addStringOption(opt => opt
            .setName('pays')
            .setDescription(`Le pays d'origine du membre`)
            .setRequired(true)
            .addChoices(
                {name: `France`, value: `+33`},
                {name: `Belgique`, value: `+32`},
                {name: `Algérie`, value: `+213`},
                {name: `Maroc`, value: `+212`},
                {name: `Canada`, value: `+1`},
                {name: `Suisse`, value: `+41`},
                {name: `Sénégal`, value: `+221`},
            )
        )
        .addStringOption(opt => opt
            .setName('numero')
            .setDescription(`Le téléphone du membre (commencer par 0)`)
            .setRequired(true)
        )
        .addStringOption(opt => opt
            .setName(`renfo`)
            .setDescription(`Le type de renfos à envoyer`)
        )
        .addStringOption(opt => opt
            .setName(`contact`)
            .setDescription(`Les personnes à contacter (à mentionner dans le champs)`)
        )
    )

export async function run(intera:ChatInputCommandInteraction) {
    let contact: contactSheet[] = JSON.parse(readFileSync('./data/contacts.json', 'utf-8'));
    switch (intera.options.getSubcommand()) {
        case 'create':
            await createContactElement(intera, contact);
            break;

        case 'delete':
            await deleteContactElement(intera, contact);
            break;

        case 'list':
            listContact(intera, contact);
            break;
    }
}

export class contactSheet {

    constructor (
        public pseudo: string,
        public user:string,
        public phone:string,
        public origin:string,
        public renfo:string | null,
        public mates: string[] | null,
        ) { 
            if(!renfo) this.renfo = 'Non défini';
        }

    isAlreadyPresent() {
        let db:contactSheet[] = JSON.parse(readFileSync('./data/contacts.json', 'utf-8'));
        return db.some(element => element.pseudo == this.pseudo);
    }

    displayMates() {
        let output:string = "";
        this.mates?.forEach(e => output += `<@${e}>, `)
        return output.slice(0, -2);
    }

    displayPhoneNumber() {
        return `${this.origin}${this.phone.slice(1)}`
    }

}


async function createContactElement(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    let pseudo = intera.options.getString('pseudo') as string;
    let discord = intera.options.getUser('discord')?.id as string;
    let origin = intera.options.getString('pays') as string;
    let phoneNum = intera.options.getString('numero') as string;
    let renfo = intera.options.getString('renfo');
    let mates = intera.options.getString('contact');


    let element = new contactSheet (pseudo, discord, phoneNum, origin, renfo, Utils.getMentionnedIdsFromString(mates, "user"));

    if(element.isAlreadyPresent()) {
        let validation:boolean;
        validation = await askToReplace(element, intera);
        if(!validation)
            return Utils.interaReply({ content: Constants.text.commands.cancelledCommand, components: [] }, intera);
    }
    contact.push(element);
    let confirmEmbed = createContactEmbed(element, element.isAlreadyPresent());
    Utils.interaReply({content: "", embeds: [confirmEmbed], components: []}, intera);

    writeFileSync('./data/contacts.json', JSON.stringify(contact));
}

function createContactEmbed(element:contactSheet, present:boolean) {
    let title:string;
    present ? title = `Contact modifié !` : title = `Contact ajouté à l'annuaire!`;
    return new EmbedBuilder()
        .setTitle(title)
        .addFields(
            {
                name: `Pseudo en jeu`,
                value: `${element.pseudo}`
            },
            {
                name: `Compte discord`,
                value: `<@${element.user}>`
            },
            {
                name: `Numéro de téléphone`,
                value: `${element.displayPhoneNumber()}`
            },
            {
                name: `Renfo`,
                value: `${element.renfo}`
            },
            {
                name: `Membres à contacter`,
                value: `${element.displayMates()}`
            },
        )
}

async function askToReplace(element:contactSheet, intera:ChatInputCommandInteraction) {
    let buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('replace-contact-yes')
                .setLabel('Oui')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('replace-contact-no')
                .setLabel('Non')
                .setStyle(ButtonStyle.Danger)
        )

    intera.reply({ content: `${Constants.text.contacts.askToReplace}${element.pseudo}?`, components: [buttons] })

    let response = await intera.channel?.awaitMessageComponent({ componentType: ComponentType.Button, filter: (button) => button.user.id === intera.user.id, time: 30000 })
    return !(!response || response.customId.endsWith('no'))
}

async function deleteContactElement(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    
}

async function listContact(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    
}
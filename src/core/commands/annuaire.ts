import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
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

async function createContactElement(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    let pseudo = intera.options.getString('pseudo') as string;
    let discord = intera.options.getUser('discord')?.id as string;
    let renfo = intera.options.getString('renfo');
    let mates = intera.options.getString('contact');

    let element = new contactSheet (pseudo, discord, renfo, Utils.getMentionnedIdsFromString(mates, "user"))
    if(element.isAlreadyPresent())

    writeFileSync('./data/contacts.json', JSON.stringify(contact));


}

export class contactSheet {

    constructor (
        public pseudo: string,
        public user:string,
        public renfo:string | null,
        public mates: string[] | null,
        ) { }

    isAlreadyPresent() {
        let db:contactSheet[] = JSON.parse(readFileSync('./data/contacts.json', 'utf-8'));
        return db.some(element => element.pseudo == this.pseudo);
    }
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
}

async function deleteContactElement(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    
}

async function listContact(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    
}
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { readFileSync } from "fs";

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
    let contact = JSON.parse(readFileSync('./data/contacts.json', 'utf-8'));
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

async function createContactElement(intera:ChatInputCommandInteraction, contact:any) {
    let pseudo = intera.options.getString('pseudo');
    let discord = intera.options.getUser('discord');
    let renfo = intera.options.getString('renfo');
    let mates = intera.options.getString('contact');
    console.log(mates)

    contact[pseudo as keyof typeof contact] = {
        discord: discord,
        renfo: renfo,
    }
}

async function deleteContactElement(intera:ChatInputCommandInteraction, contact:any) {
    
}

async function listContact(intera:ChatInputCommandInteraction, contact:any) {
    
}
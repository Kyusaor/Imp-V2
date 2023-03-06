import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, ComponentType, EmbedBuilder, EmbedField, SlashCommandBuilder } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { ImpServer } from "../../main.js";
import { Constants } from "../models/constants.js";
import { Utils, contactSheet } from "../utils.js";
import { findContactElement } from "./contact.js";

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
    .addSubcommand(sub => sub
        .setName(`delete`)
        .setDescription(`Supprime un seul ou tous les comptes d'un membre de l'annuaire`)
        .addStringOption(opt => opt
            .setName(`pseudo`)
            .setDescription(`Le pseudo du compte`)
            .setAutocomplete(true)
        )
        .addUserOption(opt => opt
            .setName(`discord`)
            .setDescription(`Le compte discord du membre (supprime tous les comptes liés)`)
        )
    )
    .addSubcommand(sub => sub
        .setName(`edit`)
        .setDescription(`Modifie un élément de l'annuaire`)
        .addStringOption(opt => opt
            .setName(`pseudo`)
            .setDescription(`Le pseudo du contact`)
            .setAutocomplete(true)
            .setRequired(true)
        )
        .addUserOption(opt => opt
            .setName(`discord`)
            .setDescription(`Le compte discord du membre`)
        )
        .addStringOption(opt => opt
            .setName('pays')
            .setDescription(`Le pays d'origine du membre`)
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
            
        case 'edit':
            await editContactElement(intera, contact);
            break;

        case 'list':
            listContact(intera, contact);
            break;
    }
    
    writeFileSync('./data/contacts.json', JSON.stringify(contact))
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
}

async function deleteContactElement(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    let pseudo = intera.options.getString('pseudo') as string;
    let discord = intera.options.getUser('discord')?.id as string;
    let member = await intera.guild?.members.fetch(discord);
    if(!member)
        return Utils.interaReply(Constants.text.contacts.memberNotFound, intera);

    let profiles = findContactElement(pseudo, member.user, contact);
    if(typeof profiles === "string")
        return Utils.interaReply(profiles, intera);

    let finalResponse:string;
    switch(profiles.length) {
        case 0:
            return Utils.interaReply(Constants.text.errors.errorFetchMember, intera);

        case 1:
            let pseudo = profiles[0].pseudo;
            let sheetIndex = contact.findIndex(e => e.pseudo == pseudo);
            contact.splice(sheetIndex, 1);
            finalResponse = `La fiche contact du compte **${pseudo}** a bien été supprimée`
            break;
        
        default:
            let deletedSheets:string[] = [];
            for(let profile of profiles) {
                let sheetIndex = contact.findIndex(e => e.pseudo == profile.pseudo);
                contact.splice(sheetIndex, 1);
                deletedSheets.push(profile.pseudo);
            }
            finalResponse = `Les fiches contacts des comptes ${deletedSheets.join(', ')} ont bien été supprimées`;
            break;
    }

    Utils.interaReply(finalResponse, intera);
}

async function listContact(intera:ChatInputCommandInteraction, contact:contactSheet[]) {
    
}

function applyEditChanges (db:contactSheet[], old:contactSheet, changes:{
    user: string;
    origin: string;
    phone: string;
    renfo: string | null;
    mates: string[] | null;
}) {

    let newElementData:{
        pseudo: string,
        user: string,
        phone: string,
        origin: string,
        renfo: string | null,
        mates: string[] | null
    } = { pseudo: "", user: "", phone: "", origin: "", renfo: null, mates: null };

    for(let dataName of Object.keys(old)) {
        if(!Object.keys(changes).includes(dataName)) continue;
        let newValue = changes[dataName as keyof typeof changes] as any;
        let oldValue = old[dataName as keyof typeof changes] as any;
        if (newValue && newValue !== oldValue)
            newElementData[dataName as keyof typeof newElementData] = newValue;
        else if (oldValue)
            newElementData[dataName as keyof typeof newElementData] = oldValue;
    }
    let newElement = new contactSheet(old.pseudo, newElementData.user, newElementData.phone, newElementData.origin, newElementData.renfo, newElementData.mates);

    let oldIndex = db.findIndex(e => e.pseudo == newElement.pseudo);
    db[oldIndex] = newElement;
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

function baseListEmbedBuilder(db:contactSheet[]) {
    let embed = new EmbedBuilder()
        .setTitle("**Annuaire Imp**")
        .setDescription("Voilà la liste des contacts des membres de la guilde")
        .setThumbnail(ImpServer.iconURL())
        .setFooter({text: "Faites la commande /contact pour retrouver facilement un membre !"})

    let sortedDb:contactSheet[] = db.sort((a, b) => a.pseudo.localeCompare(b.pseudo));
    let embedFieldList:EmbedField[] = []
    for(let element of sortedDb) {
        
        let firstLetter = element.pseudo.slice(0, 1);
        let fieldValue = `\n${element.pseudo} | <@${element.user}> | ${element.displayPhoneNumber()} | ${element.renfo} | ${element.displayMates()}`

        if(embedFieldList[embedFieldList.length - 1]?.name !== `[${firstLetter}]`)
            embedFieldList.push({ name: `[${firstLetter}]`, value: fieldValue, inline: false })
        else {
            let previousValue = embedFieldList[embedFieldList.length - 1];
            embedFieldList[embedFieldList.length - 1] = { name: previousValue.name, value: `${previousValue.value + fieldValue}`, inline: false }
        }

    }

    embed.addFields(embedFieldList);
    return embed
}

function createContactEmbed(element:contactSheet, present:boolean) {
    let title:string;
    present ? title = `Contact modifié !` : title = `Contact ajouté à l'annuaire!`;
    return new EmbedBuilder()
        .setTitle(title)
        .addFields(element.createEmbedFields())
}

function createEditFieldList(oldData: contactSheet, newData: {
    user: string | null;
    origin: string | null;
    phone: string | null;
    renfo: string | null;
    mates: string[] | null;
}) {

    let field: EmbedField[] = [];
    for (let fieldName of Object.keys(newData)) {
        let newValue = newData[fieldName as keyof typeof newData];
        let oldValue = oldData[fieldName as keyof typeof oldData];
        if(newValue && fieldName == "mates" && typeof newValue !== 'string')
            newValue = newValue.join(', ');
        if (!oldValue || oldValue.length == 0)
            oldValue = `Non défini`;

        let name = contactSheet.formatDbVariableName(fieldName);
        if (!newValue || newValue == oldValue)
            field.push({ name: name, value: oldValue as string, inline: false })
        else
            field.push({ name: `${name} (modifié)`, value: `${oldValue}\n=>\n${newValue}`, inline: false })
    }
    return field;
}

async function editContactElement(intera:ChatInputCommandInteraction, contact: contactSheet[]) {
    let pseudo = intera.options.getString('pseudo') as string;
    let user = intera.options.getUser('discord')?.id as string;
    let origin = intera.options.getString('pays') as string;
    let phone = intera.options.getString('numero') as string;
    let renfo = intera.options.getString('renfo');
    let mates = intera.options.getString('contact');


    let element = new contactSheet (pseudo, user, phone, origin, renfo, Utils.getMentionnedIdsFromString(mates, "user"));
    let input = { user, origin, phone, renfo, mates: Utils.getMentionnedIdsFromString(mates, "user") };

    if(!element.isAlreadyPresent())
        return Utils.interaReply(Constants.text.contacts.memberNotFound, intera);

    let validation:boolean;
    validation = await askToReplace(element, intera);
    if(!validation)
        return Utils.interaReply({ content: Constants.text.commands.cancelledCommand, components: [] }, intera);
    
    let oldContact = findContactElement(pseudo, null, contact) as contactSheet[];
    let fieldList = createEditFieldList(oldContact[0], input);

    let embed = new EmbedBuilder()
        .setTitle(`Contact modifié!`)
        .setDescription(`Voici la liste des modifications`)
        .addFields(fieldList)

    applyEditChanges(contact, oldContact[0], input);
    
    Utils.interaReply({ content: "", embeds: [embed], components: [] }, intera);
}
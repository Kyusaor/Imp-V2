import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ApplicationCommandOptionChoiceData, AutocompleteInteraction, ButtonStyle, CommandInteraction, InteractionReplyOptions, Role } from "discord.js";
import { readFileSync } from "fs";
import { roleData } from "../main.js";

export class Utils {

    static async autocompleteManager(intera: AutocompleteInteraction) {
        let choices: ApplicationCommandOptionChoiceData<string | number>[] = [];
        const focusOpt = intera.options.getFocused().toLowerCase();

        switch (intera.commandName) {
            case 'contact':
                let db = JSON.parse(readFileSync('./data/contacts.json', 'utf-8')) as contactSheet[];
                choices = db.map(e => e.pseudo)
                    .filter(e => e.toLowerCase().includes(focusOpt))
                    .map(e => ({ name: e, value: e }))
                break;

            case 'editroles':
                choices = Object.keys(roleData)
                    .filter(e => e.toLowerCase().includes(focusOpt))
                    .map(e => ({ name: e, value: e }))
                break;
        }

        if (choices.length > 25) choices = [{ name: "Trop d'éléments, continuez d'écrire pour affiner la recherche", value: "error" }]
        await intera.respond(choices);
    }

    static displayDate(date: Date, format: "console" | "user") {

        let day = formatTo2Digits(date.getDate());
        let month = formatTo2Digits(date.getMonth() + 1);
        let year = date.getFullYear();
        let hour = formatTo2Digits(date.getHours());
        let minutes = formatTo2Digits(date.getMinutes());
        let seconds = formatTo2Digits(date.getSeconds());
        let daysSince = displayDaysSince(date.getTime());

        if (format == "console")
            return `[${day}/${month}] [${hour}:${minutes}:${seconds}]`;
        else
            return day + "/" + month + "/" + year + " à " + hour + ":" + minutes + " (il y a " + daysSince + " jours)"

    }

    static generateYesNoButtons(label: string) {

        let buttons = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`${label}-yes`)
                    .setStyle(ButtonStyle.Success)
                    .setLabel("Oui"),

                new ButtonBuilder()
                    .setCustomId(`${label}-no`)
                    .setStyle(ButtonStyle.Danger)
                    .setLabel("Non")
            ])

        return buttons
    }

    static getMentionnedIdsFromString(str: string | null, scope: "user" | "channel" | "role") {
        let reg: RegExp;
        let prefixLength: number;
        switch (scope) {
            case 'user':
                reg = /<@[0-9]{15,20}>/g;
                prefixLength = 2;
                break;

            case 'channel':
                reg = /<#[0-9]{15,20}>/g;
                prefixLength = 2;
                break;

            case 'role':
                reg = /<@&[0-9]{16,21}>/g;
                prefixLength = 3;
                break;
        }

        let matchArray = str?.match(reg);
        if (matchArray == null) return [];

        let finalArray: string[] = [];
        for (let element of matchArray) {
            finalArray.push(element.slice(prefixLength, -1))
        }
        return finalArray;
    }

    static async interaReply(content: InteractionReplyOptions | string, intera: CommandInteraction) {
        if (!intera.deferred && !intera.replied) return intera.reply(content);
        try {
            intera.editReply(content);
        }
        catch {
            await intera.deleteReply().catch(e => e)
            return intera.followUp(content).catch(e => console.log(e))
        }
    }
}

export class contactSheet {

    constructor(
        public pseudo: string,
        public user: string,
        public phone: string,
        public origin: string,
        public renfo: string | null,
        public mates: string[] | null,
    ) {
        if (!renfo) this.renfo = 'Non défini';
    }

    isAlreadyPresent() {
        let db: contactSheet[] = JSON.parse(readFileSync('./data/contacts.json', 'utf-8'));
        return db.some(element => element.pseudo == this.pseudo);
    }

    displayMates() {
        let output: string = "";
        this.mates?.forEach(e => output += `<@${e}>, `)
        output.length !== 0 ?
            output = output.slice(0, -2) : output = `Aucun contact fourni`;
        return output;
    }

    displayPhoneNumber() {
        return `${this.origin == "other" ? "" : this.origin}${this.phone.slice(1)}`
    }

    createEmbedFields() {
        return [
            {
                name: `Pseudo en jeu`,
                value: `${this.pseudo}`
            },
            {
                name: `Compte discord`,
                value: `<@${this.user}>`
            },
            {
                name: `Numéro de téléphone`,
                value: `${this.displayPhoneNumber()}`
            },
            {
                name: `Renfo`,
                value: `${this.renfo}`
            },
            {
                name: `Membres à contacter`,
                value: `${this.displayMates()}`
            },
        ]
    }

    static formatDbVariableName(variable: string) {
        let names = {
            user: "Compte discord",
            phone: "Numéro de téléphone",
            origin: "Préfixe téléphonique national",
            renfo: "Troupes à envoyer en renfo",
            mates: "Membres à contacter",
        }
        let response: string;
        Object.keys(names).includes(variable) ?
            response = names[variable as keyof typeof names] : response = 'ERROR_NAME';
        return response;
    }
}

function displayDaysSince(date: number) {
    let mtn = Date.now();
    let ecart = Math.floor((mtn - date) / 86400000);
    return ecart.toString()
}

function formatTo2Digits(value: number) {
    return value.toString().padStart(2, '0')
}
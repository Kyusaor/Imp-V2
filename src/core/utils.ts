import { ActionRowBuilder, ButtonBuilder } from "@discordjs/builders";
import { ButtonStyle, CommandInteraction, InteractionReplyOptions } from "discord.js";

export class Utils {

    static displayDate (date:Date, format:"console" | "user") {

        let day = formatTo2Digits(date.getDate());
        let month = formatTo2Digits(date.getMonth() + 1);
        let year = date.getFullYear();
        let hour = formatTo2Digits(date.getHours());
        let minutes = formatTo2Digits(date.getMinutes());
        let seconds = formatTo2Digits(date.getSeconds());
        let daysSince = displayDaysSince(date.getTime());

        if(format == "console")
            return `[${day}/${month}] [${hour}:${minutes}:${seconds}]`;
        else 
            return day + "/" + month + "/" + year + " à " + hour + ":" + minutes + " (il y a " + daysSince + " jours)"
        
    }

    static generateYesNoButtons(label:string) {

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

    static getMentionnedIdsFromString(str:string | null, scope:"user" | "channel" | "role") {
        let reg:RegExp;
        let prefixLength:number;
        switch(scope) {
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
        if(matchArray == null) return [];

        let finalArray:string[] = [];
        for(let element of matchArray) {
            finalArray.push(element.slice(prefixLength, -1))
        }
        return finalArray;
    }

    static async interaReply(content:InteractionReplyOptions | string, intera:CommandInteraction) {
        if(!intera.deferred && !intera.replied) return intera.reply(content);
        try  {
            intera.editReply(content);
        }
        catch {
            await intera.deleteReply().catch(e => e)
            return intera.followUp(content).catch(e => console.log(e))
        }
    }
}


function displayDaysSince(date:number) {
    let mtn = Date.now();
    let ecart = Math.floor((mtn - date) / 86400000);
    return ecart.toString()
}

function formatTo2Digits(value:number) {
    return value.toString().padStart(2, '0')
}
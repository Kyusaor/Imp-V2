import { ActionRowBuilder, CommandInteraction, GuildMember, ModalActionRowComponentBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { readdirSync } from "fs";

export class Methods {

    static async commandFetching () {
        const commandFiles = readdirSync('./src/core/commands/');
        var commandsData = [];

        for(let i of commandFiles){
            let file = await import(`../commands/${i.slice(0, -3)}.js`);
            if(!file) continue;
            commandsData.push(file.CommandBuilder)
        }

        console.log(commandsData)
    }

    //Command handler
    static async commandInteractionHandler(intera: CommandInteraction) {

        let commandFile = await import(`../commands/${intera.command?.name.toLowerCase()}.js`);
        if(!commandFile) 
            return intera.reply("Module de commande indisponible");
        await commandFile.run(intera);
        
    }

    //Build standard modal when a new member arrives
    static constructIncomeModal (member: GuildMember){

        let memberId = member.user.id;

        let modal = new ModalBuilder()
            .setTitle(`Bienvenue chez **Imp** ${member.user.username} !`)
            .setCustomId(`${memberId}-incomeModal`)
            .addComponents([
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`${memberId}-incomeModal-nick`)
                        .setLabel("Quel est votre pseudo dans Lords Mobile?")
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(32)
                        .setMinLength(2)
                    )
            ])

        return modal;
    }
    
}
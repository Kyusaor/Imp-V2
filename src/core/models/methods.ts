import { 
    ActionRowBuilder,
    AnySelectMenuInteraction,
    CommandInteraction,
    GuildMember,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle 
} from "discord.js";
import { bot } from "../../main.js";
import { Constants } from "./constants.js";

export class Methods {

    //Command handler
    static async commandInteractionHandler(intera: CommandInteraction) {

        let commandFile = await import(`../commands/${intera.commandName.toLowerCase()}.js`);
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
    
    static async newMemberManager (intera: AnySelectMenuInteraction) {
    }

    static async selectMenuInteractionHandler (intera: AnySelectMenuInteraction) {
        if(intera.customId == "r4-select")
            await this.newMemberManager(intera);
    }
}
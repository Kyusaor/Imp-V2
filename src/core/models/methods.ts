import { 
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextChannel,
    TextInputBuilder,
    TextInputStyle, 
    User
} from "discord.js";
import { bot } from "../../main.js";
import { Utils } from "../utils.js";
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
    
    static async newMemberHandler(member: GuildMember) {
        let r4CheckoutChannel = await bot.channels.fetch(Constants.channelsId.R4_CHECKOUT) as TextChannel;
        let newMemberEmbedRole = newMemberEmbedRoleBuilder(member.user);
        r4CheckoutChannel.send(newMemberEmbedRole);
    }

    static async selectMenuInteractionHandler (intera: AnySelectMenuInteraction) {
        if(intera.customId == "r4-select"){
            let r4CheckoutChannel = await bot.channels.fetch(Constants.channelsId.R4_CHECKOUT) as TextChannel;
            r4CheckoutChannel.send(pingInvitingR4(intera.user.username, intera.values[0]))
            intera.reply({content: "Les r4 ont été prévenu, ils vont bientôt vous donner l'accès au reste du serveur", ephemeral: true})
        }
    }
}


function pingInvitingR4(member:string, r4:string) {
    return `<@${r4}>, il y a ${member} à la porte du serveur`
}

function newMemberEmbedRoleBuilder(user:User) {
    let embed = new EmbedBuilder()
        .setTitle("Un nouveau membre est arrivé")
        .setThumbnail(`${user.displayAvatarURL()}`)
        .addFields([
            {name: "Pseudo", value: `${user.tag}`},
            {name: "ID", value: `${user.id}`},
            {name: "Date de création du compte", value: `${Utils.displayDate(user.createdAt, "user")}`}
        ])

    let buttons = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setCustomId('r4check-imp')
                .setLabel('Imp')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('r4check-zak')
                .setLabel('zak')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('r4check-guest')
                .setLabel('Invité')
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId('r4check-kick')
                .setLabel('kick')
                .setStyle(ButtonStyle.Danger)
        ])

    return {embeds: [embed], components: [buttons]}
}
import { 
    ActionRowBuilder,
    AnySelectMenuInteraction,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
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
            .setTitle(`Bienvenue chez Imp ${member.user.username} !`)
            .setCustomId(`${memberId}-incomeModal`)
            .addComponents([
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId(`${memberId}-incomeModal-nick`)
                        .setLabel("Quel est votre pseudo dans Lords Mobile?")
                        .setStyle(TextInputStyle.Short)
                        .setMaxLength(32)
                        .setMinLength(2)
                        .setRequired(true)
                    )
            ])

        return modal;
    }

    //Manage changing nickname to modal reception
    static async modalSubmitManager(modal: ModalSubmitInteraction) {
        modal.reply({content: Constants.text.newMember.endNickname, ephemeral: true});
        let nick = modal.fields.getTextInputValue(`${modal.user.id}-incomeModal-nick`);
        if(!nick) return;
        let member = await modal.guild?.members.fetch(modal.user.id) as GuildMember;
        return member.setNickname(nick);
    }
    
    //Executed when a new member join
    static async newMemberHandler(member: GuildMember) {
        let r4CheckoutChannel = await bot.channels.fetch(Constants.channelsId.R4_CHECKOUT) as TextChannel;
        let newMemberEmbedRole = newMemberEmbedRoleBuilder(member.user);
        r4CheckoutChannel.send(newMemberEmbedRole);
    }

    //Select menu handler
    static async selectMenuInteractionHandler (intera: AnySelectMenuInteraction) {
        if(intera.customId == "r4-select"){
            let r4CheckoutChannel = await bot.channels.fetch(Constants.channelsId.R4_CHECKOUT) as TextChannel;
            r4CheckoutChannel.send(pingInvitingR4(intera.user.username, intera.values[0]));

            intera.reply({content: Constants.text.newMember.askNickname, components: [Utils.generateYesNoButtons("askNickname")], ephemeral: true});
            
            let nick = await intera.channel?.awaitMessageComponent({ filter: (inter) => inter.user.id == intera.user.id && inter.customId.startsWith("askNickname"), time: 60000, componentType: ComponentType.Button})
            if(!nick)
                return intera.editReply({content: Constants.text.newMember.cancelNickname, components: []});
            if (nick.customId.endsWith("no")){
                let nicknameModal = this.constructIncomeModal(intera.member as GuildMember);
                nick.showModal(nicknameModal);
            }
            return intera.editReply({content: Constants.text.newMember.endNickname, components: []});
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
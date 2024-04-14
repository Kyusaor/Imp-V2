import {
    ActionRowBuilder,
    AnySelectMenuInteraction,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    Message,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    Role,
    RoleResolvable,
    TextChannel,
    TextInputBuilder,
    TextInputStyle,
    User
} from "discord.js";
import { bot, roleData } from "../../main.js";
import { Utils } from "../utils.js";
import { Constants } from "./constants.js";

export class Methods {

    //Button handler
    static async buttonHandler(button: ButtonInteraction) {
        if (button.customId.startsWith('r4check')) await this.newMemberRoleGiver(button);
    }

    //Command handler
    static async commandInteractionHandler(intera: CommandInteraction) {

        let commandFile = await import(`../commands/${intera.commandName.toLowerCase()}.js`);
        if (!commandFile)
            return intera.reply(Constants.text.errors.unavailableCommand);
        await commandFile.run(intera);

    }

    //Build standard modal when a new member arrives
    static constructIncomeModal(member: GuildMember) {

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
        modal.reply({ content: Constants.text.newMember.endNickname, ephemeral: true });
        let nick = modal.fields.getTextInputValue(`${modal.user.id}-incomeModal-nick`);
        if (!nick) return;
        let member = await modal.guild?.members.fetch(modal.user.id) as GuildMember;
        return member.setNickname(nick);
    }

    //Executed when a new member join
    static async newMemberHandler(member: GuildMember) {
        let r4CheckoutChannel = await bot.channels.fetch(Constants.channelsId.R4_CHECKOUT) as TextChannel;
        let newMemberEmbedRole = newMemberEmbedRoleBuilder(member.user);
        r4CheckoutChannel.send(newMemberEmbedRole);
    }

    //Handle role attribution
    static async newMemberRoleGiver(button: ButtonInteraction) {
        if (memberAlreadyTreated(button))
            return button.reply({ content: `${Constants.text.errors.memberAlreadyTreated} ${button.message.embeds[0].fields[3].value}`, ephemeral: true });
        let type = button.customId.slice(8);
        let memberId = getMemberIdFromR4Embed(button);
        let member: GuildMember;
        try {
            member = await button.guild?.members.fetch(memberId) as GuildMember;
        }
        catch {
            return button.reply({ content: Constants.text.errors.errorFetchMember, ephemeral: true });
        }
        if (type == "kick") {
            member.kick("Kick r4")
            await button.channel?.send('🤸‍♂️🏌️')
            return button.reply(`${member.user.username} a été kick!`)
        }
        else {
            await roleData[type].forEach(async r => await member.roles.add(r))
            button.reply(`Les rôles ${button.component.label} ont été attribués à ${member.user.username}`)
        }
        editNewMemberEmbedAttribution(button.message, button.component.label as string);
    }

    //Select menu handler
    static async selectMenuInteractionHandler(intera: AnySelectMenuInteraction) {
        switch (intera.customId) {
            case "r4-select":
                let r4CheckoutChannel = await bot.channels.fetch(Constants.channelsId.R4_CHECKOUT) as TextChannel;
                r4CheckoutChannel.send(pingInvitingR4(intera.user.username, intera.values[0]));

                intera.reply({ content: Constants.text.newMember.askNickname, components: [Utils.generateYesNoButtons("askNickname")], ephemeral: true });

                let nick = await intera.channel?.awaitMessageComponent({ filter: (inter) => inter.user.id == intera.user.id && inter.customId.startsWith("askNickname"), time: 60000, componentType: ComponentType.Button })
                if (!nick)
                    return intera.editReply({ content: Constants.text.newMember.cancelNickname, components: [] });
                if (nick.customId.endsWith("no")) {
                    let nicknameModal = this.constructIncomeModal(intera.member as GuildMember);
                    nick.showModal(nicknameModal);
                }
                intera.editReply({ content: Constants.text.newMember.endNickname, components: [] });
                break;

            case 'Autorole-menu':
                let listEditedRoles: { add: string[], del: string[] } = { add: [], del: [] };
                let checked = intera.values;
                let member = await intera.guild?.members.fetch(intera.user.id) as GuildMember;
                let oldRolesList = member.roles.cache.map(r => r.id);

                for (let roleName of Object.keys(Constants.rolesId.autorole)) {
                    let roleId = Constants.rolesId.autorole[roleName as keyof object];
                    //Role checked but not present
                    if (checked.includes(roleName) && !oldRolesList.includes(roleId)) {
                        let role = await intera.guild?.roles.fetch(roleId) as Role;
                        await member.roles.add(role)
                        listEditedRoles.add.push(role.name)
                    }
                    //Role not checked but already present
                    else if (!checked.includes(roleName) && oldRolesList.includes(roleId)) {
                        let role = await intera.guild?.roles.fetch(roleId) as Role;
                        await member.roles.remove(role)
                        listEditedRoles.del.push(role.name)
                    }
                }
                let payload: string = "";
                if (listEditedRoles.add.length == 0 && listEditedRoles.del.length == 0) payload = Constants.text.commands.autoroleNoProvidedRoles;
                else payload = buildAutoleMessagePayload(listEditedRoles);
                intera.reply({ content: payload, ephemeral: true });
                break;
        }
    }
}


function getMemberIdFromR4Embed(button: ButtonInteraction) {
    return button.message.embeds[0].fields[1].value;
}

function pingInvitingR4(member: string, r4: string) {
    return `<@${r4}>, il y a ${member} à la porte du serveur`
}

function newMemberEmbedRoleBuilder(user: User) {
    let embed = new EmbedBuilder()
        .setTitle("Un nouveau membre est arrivé")
        .setThumbnail(`${user.displayAvatarURL()}`)
        .addFields([
            { name: "Pseudo", value: `${user.tag}` },
            { name: "ID", value: `${user.id}` },
            { name: "Date de création du compte", value: `${Utils.displayDate(user.createdAt, "user")}` },
            { name: "Attribution", value: "Non traitée" }
        ])

    let buttons = formatNewMemberBoardButtonList();

    return { embeds: [embed], components: buttons }
}


function memberAlreadyTreated(button: ButtonInteraction) {
    let content = button.message.embeds[0].fields[3].value;
    return content !== "Non traitée"
}

function editNewMemberEmbedAttribution(msg: Message, type: string) {
    let data = msg.embeds[0].data;
    if (!data.fields)
        return console.log(Constants.text.errors.memberEmbedFieldsUnavailable);
    data.fields[3].value = type;
    msg.edit({ embeds: [new EmbedBuilder(data)] });
}

function buildAutoleMessagePayload(list: { add: string[]; del: string[] }) {
    let returnedString = "Vos rôles ont été mis à jour:\n\n";
    list.add.forEach(e => returnedString += `-ajout: ${e}\n`);
    if (list.add.length !== 0)
        returnedString += "\n";
    list.del.forEach(e => returnedString += `-retrait: ${e}\n`)

    return returnedString;
}

function formatNewMemberBoardButtonList(): ActionRowBuilder<ButtonBuilder>[] {
    let buttonsList: ActionRowBuilder<ButtonBuilder>[] = [];
    let rows = new ActionRowBuilder<ButtonBuilder>();

    for (let data of Object.keys(roleData)) {
        if (rows.components.length == 5) {
            buttonsList.push(rows);
            rows = new ActionRowBuilder<ButtonBuilder>();
        }
        rows.addComponents([
            new ButtonBuilder()
                .setCustomId(`r4check-${data}`)
                .setLabel(data)
                .setStyle(ButtonStyle.Primary)
        ])
    }

    buttonsList.push(
        rows,
        new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
                .setCustomId('r4check-kick')
                .setLabel('kick')
                .setStyle(ButtonStyle.Danger)
        ])
    )

    return buttonsList;
}
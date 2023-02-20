import { ActionRowBuilder, CommandInteraction, EmbedBuilder, MessageCreateOptions, MessagePayload, SlashCommandBuilder, StringSelectMenuBuilder, TextChannel } from "discord.js";
import { bot } from "../../main.js";
import { Constants } from "../models/constants.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName("setautorole")
    .setDescription("Redéfinis le panneau d'auto-rôle")
    .setDefaultMemberPermissions(0)

export async function run(intera:CommandInteraction) {
    await deleteOldPannel(intera);
    let chan = await intera.guild?.channels.fetch(Constants.channelsId.AUTO_ROLE) as TextChannel;
    let pannelData = createPannelEmbed();
    await chan.send(pannelData);
    intera.reply({content: Constants.text.commands.autoroleSuccess, ephemeral: true});
}

async function deleteOldPannel(intera:CommandInteraction) {
    let chan = await intera.guild?.channels.fetch(Constants.channelsId.AUTO_ROLE) as TextChannel;
    let fetchOld = await chan.messages.fetch({ limit: 5 })
    let old = fetchOld.filter(m => m.author.id == Constants.botId);
    old.forEach(m => m.delete());
}

function createPannelEmbed () {
    let embed = new EmbedBuilder()
        .setTitle("__Auto-rôle__")
        .setDescription("Choisissez les mentions que vous voulez avoir sur le serveur")
        .setThumbnail(Constants.images.autoroleThumbnail)

    let menu = new StringSelectMenuBuilder()
        .setCustomId('Autorole-menu')
        .setPlaceholder('Cliquez ici pour choisir vos rôles')
        .setMinValues(0)
        .setMaxValues(3)
        .addOptions([
            {
                label: "T4 Sombres nids",
                description: "Les sombres nids nécessitant des t4",
                value: "sn"
            },
            {
                label: "Défense",
                description: "Défenses de joueurs en cas de rally ennemi",
                value: "def"
            },
            {
                label: "Rally war",
                description: "Lorsque un rally est lancé",
                value: "rally"
            },
        ])
    let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu)

    let payload:MessageCreateOptions = {embeds: [embed], components: [row]}
    return payload
}
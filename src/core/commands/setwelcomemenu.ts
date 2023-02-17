import { ActionRowBuilder, CommandInteraction, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, TextBasedChannel } from "discord.js";
import { ImpServer, bot } from "../../main.js";
import { Constants } from "../models/constants.js";

export const CommandBuilder = new SlashCommandBuilder()
    .setName(`setwelcomemenu`)
    .setDescription(`Redéfinit le panneau d'accueil`)
    .setDefaultMemberPermissions(0)

export async function run (intera: CommandInteraction) {

    intera.deferReply({ ephemeral: true });
    let r4list = await listR4();
    let welcomeMenuBuild = constructIncomeMenu(r4list);
    let welcomeMenuEmbed = constructIncomeEmbed();
    let welcomeChannel = await bot.channels.fetch(Constants.channelsId.VALIDATION_CHANNEL) as TextBasedChannel;
    await welcomeChannel.send({embeds: [welcomeMenuEmbed], components: [welcomeMenuBuild]});
    intera.editReply({ content: "Le menu a bien été envoyé"})
}


function constructIncomeEmbed () {
    let embed = new EmbedBuilder()
        .setTitle("**Qui vous a invité?**")
        .setDescription('Cliquez en dessous pour choisir le pseudo du r4 qui vous a invité sur le discord')

    return embed;
}

function constructIncomeMenu (r4list: string[][]) {

    let menu = new StringSelectMenuBuilder()
        .setCustomId(`r4-select`)
        .setPlaceholder("Cliquez ici pour choisir")

    for(let r4 of r4list){
        menu.addOptions({
            label: r4[0],
            description: " ",
            value: r4[1],
        })
    }

    let row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
    return row;
}

async function listR4() {
    await ImpServer.members.list({ limit: 300 });
    let r4list = await ImpServer.members.cache
        .filter(m => m.roles.cache.has(Constants.rolesId.R4))
        .map(m => [m.nickname || m.user.username, m.user.id.toString()]);
    r4list.push(["Quelqu'un d'autre", `&${Constants.rolesId.R4}`]);
    return r4list;
}

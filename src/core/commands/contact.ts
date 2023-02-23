import { SlashCommandBuilder } from "discord.js";

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
            .setName(`renfo`)
            .setDescription(`Le type de renfos à envoyer`)
        )
        .addStringOption(opt => opt
            .setName(`contact`)
            .setDescription(`Les personnes à contacter (à mentionner dans le champs)`)
        )
    )
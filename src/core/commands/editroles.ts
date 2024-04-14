import { ChatInputCommandInteraction, CommandInteraction, Role, SlashCommandBuilder } from "discord.js";
import { ImpServer, roleData } from "../../main.js";
import { writeFileSync } from "fs";

export const CommandBuilder = new SlashCommandBuilder()
    .setName("editroles")
    .setDescription("Change les roles liés aux boutons d'accueil")
    .setDefaultMemberPermissions(0)
    .setDMPermission(false)
    .addSubcommand(sub =>
        sub.setName("ajout")
            .setDescription("Ajoute un rôle au panneau d'accueil")
            .addStringOption(str =>
                str.setName("nom")
                    .setDescription("Le nom qui sera affiché sur le bouton")
                    .setRequired(true)
            )
            .addStringOption(str =>
                str.setName("roles")
                    .setDescription("La liste des rôles liés (nom, id ou mention), séparés par des virgules")
                    .setRequired(true)
            )
    )
    .addSubcommand(sub =>
        sub.setName("retrait")
            .setDescription("Retire un rôle du panneau d'accueil")
            .addStringOption(str =>
                str.setName("nom")
                    .setDescription("Le paramétrage à supprimer")
                    .setRequired(true)
                    .setAutocomplete(true)
            )
    );

export async function run(intera: ChatInputCommandInteraction) {
    let sub = intera.options.getSubcommand() as "ajout" | "retrait";
    const name = intera.options.getString('nom')!;

    switch (sub) {

        case 'ajout':
            let text = intera.options.getString('roles')!.split(',');
            let reply = `Le paramètre ${name} a été défini avec les rôles suivants:`;
            let roleList: string[] = [];
            let role: Role | undefined;

            for (let roleString of text) {
                let string = roleString.trim();
                try {
                    if (!isNaN(string as any))
                        role = await ImpServer.roles.cache.find(e => e.id == string);

                    else if (string.startsWith(`<@&`))
                        role = await ImpServer.roles.cache.find(e => e.id == string.slice(3, -1))

                    else role = await ImpServer.roles.cache.find(e => e.name == string)

                    if (!role)
                        continue;
                    roleList.push(role.id);
                    reply += `\n-${role.name}`;
                }
                catch (e) {
                    continue;
                }

            }

            roleData[name] = roleList;
            writeFileSync('./data/rolesData.json', JSON.stringify(roleData));
            console.log(reply)
            intera.reply(reply);
            break;

        case 'retrait':
            let data = roleData[name];
            let response = `Le paramétrage ${name} a été supprimé. Il contenait les rôles suivants:`;

            for(let selectedRole of data) {
                let role = await ImpServer.roles.cache.get(selectedRole);
                role ?
                    response += `\n-${role.name}` :
                    response += `\n-Rôle introuvable`
            }
            delete roleData[name];
            writeFileSync(`./data/rolesData.json`, JSON.stringify(roleData));
            intera.reply(response);
            console.log(response)
            break;
    }
}
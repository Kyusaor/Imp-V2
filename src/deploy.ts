import { REST, RestOrArray, Routes, SlashCommandBuilder } from "discord.js";
import { readdirSync } from "fs";
import yesno from "yesno";
import { Config } from "../data/config.js";
import { Constants } from "./core/models/constants.js";

let commands = [];
let commandsFiles = readdirSync('./src/core/commands/')

for(const file of commandsFiles){
    const command = await import(`./core/commands/${file.slice(0, -3)}.js`);
    commands.push(command.CommandBuilder.toJSON())
}

const rest = new REST({version: '10'}).setToken(Config.token);

const todo = await yesno({
    question: "Voulez-vous deployer (y) ou supprimer (n) les commandes?",
})

//Deploy
if(todo) {

    try {
		console.log(`Recharge ${commands.length} /commandes`);

		const data = await rest.put(
			Routes.applicationGuildCommands(Constants.botId, Constants.ImpServerId),
			{ body: commands },
		) as RestOrArray<SlashCommandBuilder>;

		console.log(`${data.length} commandes rechargées avec succès`);
    } 
    catch (e) {
        console.log("erreur deploy")
        console.log(e)
    }
}

//Delete
else {
    try {
        rest.get(Routes.applicationGuildCommands(Constants.botId, Constants.ImpServerId))
        .then(data => {
            const promises:Promise<unknown>[] = [];
            for (const command of data as any) {
                const deleteUrl = `/${Routes.applicationGuildCommands(Constants.botId, Constants.ImpServerId)}/${command.id}`;
                promises.push(rest.delete(deleteUrl as `/${string}`));
            }
                return Promise.all(promises);
            }
        );
    }
    catch (e) {
        console.log("Erreur sup deploy")
        console.log(e)
    }
}
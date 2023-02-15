import { REST, RestOrArray, Routes, SlashCommandBuilder } from "discord.js";
import { readdirSync } from "fs";
import yesno from "yesno";
import { Config } from "../data/config.js";
import { Constants } from "./core/models/constants.js";

let commands = [];
let commandsFiles = readdirSync('./src/core/commands/')

for(const file of commandsFiles){
    const command = await import(`./core/commands/${file}`);
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
			Routes.applicationCommands(Constants.botId),
			{ body: commands },
		) as RestOrArray<SlashCommandBuilder>;

		console.log(`${data.length} commandes rechargées avec succès`);
    } 
    catch (e) {

    }
}

//Delete
else {
    rest.get(Routes.applicationCommands(Constants.botId))
    .then(data => {
        const promises:Promise<unknown>[] = [];
        for (const command of data as any) {
            const deleteUrl = `/${Routes.applicationCommands(Constants.botId)}/${command.id}`;
            promises.push(rest.delete(deleteUrl));
        }
        return Promise.all(promises);
    }
);

}
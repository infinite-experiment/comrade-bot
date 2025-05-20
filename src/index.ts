import {Client, GatewayIntentBits, Events, Interaction} from "discord.js";

import * as dotenv from "dotenv";
import { DiscordInteraction } from "./types/DiscordInteraction";
import { commandMap } from "./configs/commandMap";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on(Events.InteractionCreate, async(interactionRaw: Interaction) => {

    if(!interactionRaw.isChatInputCommand()) return;

    const command = commandMap[interactionRaw.commandName];

    if(!command) return;

    const interaction = new DiscordInteraction(interactionRaw);

    try {
        await command.execute(interaction);
      } catch (err) {
        console.error(err);
        await interaction.reply({
          content: "There was an error executing this command.",
          ephemeral: true,
        });
      }

});

client.login(process.env.DISCORD_BOT_TOKEN);
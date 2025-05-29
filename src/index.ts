import {Client, GatewayIntentBits, Events, Interaction} from "discord.js";

import * as dotenv from "dotenv";
import { DiscordInteraction } from "./types/DiscordInteraction";
import { commandMap } from "./configs/commandMap";
import RegisterHandler from "./commands/registerModalHandler"
import { handleFlightHistory } from "./commands/logbookHandler";

dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user.tag}`);
})

client.on(Events.InteractionCreate, async(interactionRaw: Interaction) => {

  if(interactionRaw.isModalSubmit()){
    switch(interactionRaw.customId){
      case RegisterHandler.data.name:
        await RegisterHandler.execute(new DiscordInteraction(interactionRaw))
    }
  }

  if (interactionRaw.isButton()) {
    // CustomId format: flights_prev_{ifcId}_{page}
    const [prefix, direction, ifcId, pageStr] = interactionRaw.customId.split("_");
    if (prefix === "flights" && (direction === "prev" || direction === "next")) {
      const page = parseInt(pageStr, 10);
      await handleFlightHistory(new DiscordInteraction(interactionRaw), page, ifcId);
    }
  }

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
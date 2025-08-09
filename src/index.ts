import { Client, GatewayIntentBits, Events, Interaction } from "discord.js";

import * as dotenv from "dotenv";
import { DiscordInteraction } from "./types/DiscordInteraction";
import { commandMap } from "./configs/commandMap";
import RegisterHandler from "./commands/registerModalHandler";
import InitServerHandler from "./commands/initServerModalHandler";
import { ConfigurePilotRoleHandler } from "./commands/ConfigurePilotRoleHandler"
import { SyncUserModalHandler } from "./commands/SyncUserHandler"
import { handleFlightHistory } from "./commands/logbookHandler";
import { CUSTOM_IDS } from "./configs/constants";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}`);
})

client.on(Events.InteractionCreate, async (interactionRaw: Interaction) => {
  
  if (interactionRaw.isStringSelectMenu()) {
    const [prefix, section, tag, userId] = interactionRaw.customId.split("_");

    console.log({prefix, section, tag,userId, x: interactionRaw.values[0]})
    if (prefix === CUSTOM_IDS.SET_PILOT_ROLE_MODAL) {
      console.log("HERE")
      const selectedRole = interactionRaw.values[0]; // 'pilot', 'staff', 'admin'
      await ConfigurePilotRoleHandler.execute(
        new DiscordInteraction(interactionRaw),
        section,
        selectedRole
      );
      return;
    }
  }


  if (interactionRaw.isModalSubmit()) {
    switch (interactionRaw.customId) {
      case RegisterHandler.data.name:
        await RegisterHandler.execute(new DiscordInteraction(interactionRaw));
        break;
      case InitServerHandler.data.name:
        await InitServerHandler.execute(new DiscordInteraction(interactionRaw));
        break;
      case CUSTOM_IDS.LINK_PILOT_CONFIRM:
        await SyncUserModalHandler.execute(new DiscordInteraction(interactionRaw));
        break;
      default:
        const [prefix, section, tag, userId] = interactionRaw.customId.split("_");
        if (`${prefix}_${section}_${tag}` === CUSTOM_IDS.SYNC_USER_MODAL) {
          await SyncUserModalHandler.execute(new DiscordInteraction(interactionRaw));
          break;
        }
        
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

  if (!interactionRaw.isChatInputCommand()) return;

  console.log(interactionRaw.commandName, interactionRaw.commandGuildId)
  const command = commandMap[interactionRaw.commandName];
  if (!command) return;

  const interaction = new DiscordInteraction(interactionRaw);

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "There was an error executing this command.",
    });
  }

});

client.login(process.env.DISCORD_BOT_TOKEN);
import { SlashCommandBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { handleFlightHistory } from "./logbookHandler";

export const data = new SlashCommandBuilder()
    .setName("logbook")
    .setDescription("Fetch flights from logbook of user")
    .addStringOption(option =>
        option.setName("ifc_id")
          .setDescription("The user's Infinite Flight Community ID")
          .setRequired(true)
      );



export async function execute(interaction: DiscordInteraction) {
    const page = 1;
    console.log("HI")

    await handleFlightHistory(interaction, page);
}
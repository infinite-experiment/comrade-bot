import { SlashCommandBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { handleFlightHistory } from "./logbookHandler";
import { ApiService } from "../services/apiService";

export const data = new SlashCommandBuilder()
    .setName("live")
    .setDescription("Fetch VA Live flights");


export async function execute(interaction: DiscordInteraction) {
    const page = 1;
	console.log("Interaction received");

    await ApiService.getLiveFlights(interaction.getMetaInfo())
    // await handleFlightHistory(interaction, page);
}

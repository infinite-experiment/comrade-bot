import { SlashCommandBuilder, AttachmentBuilder, MessageFlags } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { renderLiveFlights } from "../helpers/LiveTableRenderer";

export const data = new SlashCommandBuilder()
  .setName("live")
  .setDescription("Fetch VA Live flights");

export async function execute(interaction: DiscordInteraction) {
  try {
    console.log("[/live] Interaction received");

    const meta = interaction.getMetaInfo();
    const flights = await ApiService.getLiveFlights(meta);

    if (!flights || flights.length === 0) {
      await interaction.reply({
        content: "No live flights found for this VA.",
        ephemeral: true,
      });
      return;
    }

    const img = await renderLiveFlights(flights);

    await interaction.reply({
      files: [new AttachmentBuilder(img, { name: "live-flights.png" })]
    });
  } catch (err) {
    console.error("[/live] Command failed:", err);
    await interaction.reply({
      content: "An error occurred while fetching live flights."
    });
  }
}

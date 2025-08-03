import { SlashCommandBuilder, AttachmentBuilder, MessageFlags } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { renderLiveFlights } from "../helpers/LiveTableRenderer";
import { LiveFlightRecord } from "../types/Responses";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

export const data = new SlashCommandBuilder()
    .setName("live")
    .setDescription("Fetch VA Live flights");

export async function execute(interaction: DiscordInteraction) {
    try {
        console.log("[/live] Interaction received");

        const meta = interaction.getMetaInfo();

        let flights: LiveFlightRecord[] = [];

        try {
            flights = await ApiService.getLiveFlights(meta);
        } catch (err) {
            console.error("[getLiveFlights]", err);

            if (err instanceof UnauthorizedError) {
                await interaction.reply({
                    content: `❌ You're not authorized to view live flights.\n${err.message}`,
                    ephemeral: true,
                });
                return;
            }

            await interaction.reply({
                content: "❌ Failed to fetch live flights due to an unexpected error.",
                ephemeral: true,
            });
            return;
        }
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

import { SlashCommandBuilder, AttachmentBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { renderLiveFlights } from "../helpers/LiveTableRenderer";
import { LiveFlightRecord } from "../types/Responses";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

export const data = new SlashCommandBuilder()
    .setName("live")
    .setDescription("Fetch VA Live flights");

export async function execute(interaction: DiscordInteraction) {
    // Defer reply IMMEDIATELY to prevent timeout
    await interaction.deferReply();

    try {
        console.log("[/live] Interaction received");

        const meta = interaction.getMetaInfo();

        let flights: LiveFlightRecord[] = [];
        let responseTime: number | undefined;

        try {
            const startTime = Date.now();
            flights = await ApiService.getLiveFlights(meta);
            responseTime = Date.now() - startTime;
        } catch (err) {
            console.error("[getLiveFlights]", err);

            if (err instanceof UnauthorizedError) {
                await interaction.editReply({
                    content: `❌ You're not authorized to view live flights.\n${err.message}`,
                });
                return;
            }

            await interaction.editReply({
                content: "❌ Failed to fetch live flights due to an unexpected error.",
            });
            return;
        }
        if (!flights || flights.length === 0) {
            await interaction.editReply({
                content: "No live flights found for this VA.",
            });
            return;
        }

        console.log(`[/live] Rendering ${flights.length} flights...`);
        const img = await renderLiveFlights(flights, responseTime);
        console.log(`[/live] Image rendered, size: ${img.length} bytes`);

        await interaction.editReply({
            files: [new AttachmentBuilder(img, { name: "live-flights.png" })]
        });
        console.log("[/live] Reply sent successfully");
    } catch (err) {
        console.error("[/live] Command failed:", err);

        // Check if we already deferred
        if (interaction.deferred) {
            await interaction.editReply({
                content: "An error occurred while fetching live flights."
            });
        } else {
            await interaction.reply({
                content: "An error occurred while fetching live flights."
            });
        }
    }
}

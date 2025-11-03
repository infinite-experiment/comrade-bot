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
        } catch (err: any) {
            console.error("[getLiveFlights]", err);

            if (err instanceof UnauthorizedError) {
                await interaction.editReply({
                    embeds: [{
                        title: "Not Registered",
                        description: "❌ You must be registered to view live flights.\n\nUse `/register` to get started.",
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
                return;
            }

            // Check for 403 Forbidden (not registered/authorized)
            if (err.message?.includes("403") || err.message?.includes("Forbidden")) {
                await interaction.editReply({
                    embeds: [{
                        title: "Not Registered",
                        description: "❌ You must be registered to view live flights.\n\nUse `/register` to get started.",
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
                return;
            }

            // Generic error
            await interaction.editReply({
                embeds: [{
                    title: "Error",
                    description: "❌ Failed to fetch live flights.\n\nPlease try again later or contact support.",
                    color: 0xff0000,
                    timestamp: new Date().toISOString()
                }]
            });
            return;
        }
        if (!flights || flights.length === 0) {
            await interaction.editReply({
                embeds: [{
                    title: "No Live Flights",
                    description: "No live flights currently active for this VA.",
                    color: 0xff9900,
                    timestamp: new Date().toISOString()
                }]
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
                embeds: [{
                    title: "Error",
                    description: "❌ An unexpected error occurred.\n\nPlease try again or contact support.",
                    color: 0xff0000,
                    timestamp: new Date().toISOString()
                }]
            });
        } else {
            await interaction.reply({
                embeds: [{
                    title: "Error",
                    description: "❌ An unexpected error occurred.\n\nPlease try again or contact support.",
                    color: 0xff0000,
                    timestamp: new Date().toISOString()
                }]
            });
        }
    }
}

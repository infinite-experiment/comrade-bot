import {SlashCommandBuilder} from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

export const data = new SlashCommandBuilder()
    .setName("stats")
    .setDescription("View your pilot statistics and activity")

export async function execute(interaction: DiscordInteraction) {
    const chat = interaction.getChatInputInteraction();
    if (!chat) return;

    try {
        // Defer the reply since we're making API calls
        await chat.deferReply();

        const metaInfo = interaction.getMetaInfo();

        try {
            // Try to get pilot stats
            const statsResponse = await ApiService.getPilotStats(metaInfo);
            const statsData = statsResponse.data;

            if (!statsData) {
                throw new Error("No stats data received");
            }

            // Build embed fields dynamically from provider_data
            const fields: Array<{name: string, value: string, inline?: boolean}> = [];

            // Process all provider_data fields dynamically
            for (const [key, value] of Object.entries(statsData.provider_data)) {
                // Format the key to be more readable
                const fieldName = key
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                let fieldValue: string;

                if (typeof value === 'object' && value !== null) {
                    // Handle nested objects (like additional_fields)
                    fieldValue = Object.entries(value)
                        .map(([k, v]) => {
                            const nestedKey = k.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            let displayValue = v;

                            // Format total_hours specially (convert from seconds to hours)
                            if (k === 'total_hours' && typeof v === 'number' && v > 10000) {
                                const hours = Math.floor(v / 3600);
                                displayValue = `${hours.toLocaleString()} hrs`;
                            } else if (typeof v === 'number') {
                                displayValue = v.toLocaleString();
                            }

                            return `**${nestedKey}:** ${displayValue}`;
                        })
                        .join('\n');
                } else if (typeof value === 'number') {
                    fieldValue = value.toLocaleString();
                } else {
                    fieldValue = String(value);
                }

                fields.push({
                    name: fieldName,
                    value: fieldValue,
                    inline: typeof value !== 'object'
                });
            }

            // Add metadata as a field
            const metadataValue = [
                `**Cached:** ${statsData.metadata.cached ? 'Yes' : 'No'}`,
                statsData.metadata.last_fetched
                    ? `**Last Updated:** ${new Date(statsData.metadata.last_fetched).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: "UTC"
                    })} UTC`
                    : null
            ].filter(Boolean).join('\n');

            fields.push({
                name: 'Data Info',
                value: metadataValue,
                inline: false
            });

            await chat.editReply({
                embeds: [{
                    title: "Your Pilot Statistics",
                    fields: fields,
                    color: 0x0099ff,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: `${statsData.metadata.va_name || "Virtual Airline"} • Response time: ${statsResponse.response_time}`
                    }
                }]
            });
        } catch (statsErr: any) {
            if (statsErr instanceof UnauthorizedError) {
                await chat.editReply({
                    embeds: [{
                        title: "Not Authorized",
                        description: `❌ ${statsErr.message}`,
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
                return;
            }

            // If user is not registered or stats not found
            if (statsErr.message?.includes("404") || statsErr.message?.includes("not found")) {
                await chat.editReply({
                    embeds: [{
                        title: "Stats Not Available",
                        description: "❌ No pilot statistics found.\n\nMake sure you're registered with `/register` and have connected your VA account!",
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
            } else {
                // For other errors, show a generic error message
                console.error("[stats command] Error fetching pilot stats:", statsErr);
                await chat.editReply({
                    embeds: [{
                        title: "Error",
                        description: `❌ Unable to fetch pilot statistics: ${statsErr.message || 'Unknown error'}`,
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
            }
        }
    } catch(err) {
        console.error("[stats command]", err);
        // Try to respond with an error message
        try {
            await chat.editReply({
                embeds: [{
                    title: "Error",
                    description: `❌ An error occurred: ${String(err)}`,
                    color: 0xff0000
                }]
            });
        } catch (replyErr) {
            console.error("[stats command] Failed to send error message:", replyErr);
        }
    }
}

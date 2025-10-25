import {SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js";
import fetch from "node-fetch";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { MessageFormatters } from "../helpers/messageFormatter";
import { DiscordResponses } from "../helpers/discordResponses";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

export const data = new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check your registration and VA membership status")

export async function execute(interaction: DiscordInteraction) {
    const chat = interaction.getChatInputInteraction();
    if (!chat) return;

    try {
        // Defer the reply since we're making API calls
        await chat.deferReply();

        const metaInfo = interaction.getMetaInfo();

        try {
            // Try to get user details
            const userData = await ApiService.getUserDetails(metaInfo);
            const formattedMessage = MessageFormatters.generateUserDetailsString(
                userData,
                metaInfo.discordId
            );

            await chat.editReply({
                embeds: [{
                    title: "Your Status",
                    description: formattedMessage,
                    color: userData.current_va.is_member ? 0x00ff00 : 0xff9900,
                    timestamp: new Date().toISOString()
                }]
            });
        } catch (userErr: any) {
            if (userErr instanceof UnauthorizedError) {
                await chat.editReply({
                    embeds: [{
                        title: "Not Authorized",
                        description: `❌ ${userErr.message}`,
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
                return;
            }

            // If user is not registered, show a helpful message
            if (userErr.message?.includes("404") || userErr.message?.includes("not found")) {
                await chat.editReply({
                    embeds: [{
                        title: "Not Registered",
                        description: "❌ You are not registered yet.\n\nUse `/register` to get started!",
                        color: 0xff0000,
                        timestamp: new Date().toISOString()
                    }]
                });
            } else {
                // For other errors, show system health as fallback
                console.error("[status command] Error fetching user details:", userErr);
                const healthData = await ApiService.getHealth(metaInfo);
                const healthMessage = MessageFormatters.generateHealthString(healthData);
                await chat.editReply({
                    embeds: [{
                        title: "System Status",
                        description: `Unable to fetch user details. Here's the system status:\n\n${healthMessage}`,
                        color: 0xff9900,
                        timestamp: new Date().toISOString()
                    }]
                });
            }
        }
    } catch(err) {
        console.error("[status command]", err);
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
            console.error("[status command] Failed to send error message:", replyErr);
        }
    }
}
import {SlashCommandBuilder, ChatInputCommandInteraction} from "discord.js";
import fetch from "node-fetch";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { MessageFormatters } from "../helpers/messageFormatter";
import { DiscordResponses } from "../helpers/discordResponses";

export const data = new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check System Health")

export async function execute(interaction: DiscordInteraction) {
    try {
        const data = await ApiService.getHealth(interaction.getMetaInfo());
        const formattedMessage = MessageFormatters.generateHealthString(data);
        await DiscordResponses.replyWithEmbed(
            interaction,
            "Status",
            formattedMessage
        );
        //await interaction.reply("Checking system health");
    } catch(err) {
        await interaction.reply(String(err));
    }
}
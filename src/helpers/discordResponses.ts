import { EmbedBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";

const AUTHOR = "infinite-experiment";

export class DiscordResponses {

    static async replyWithEmbed(
        interaction: DiscordInteraction,
        title: string,
        description: string,
        color: number = 0x0099ff
    ) {
        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(color);
        
        await interaction.reply({
            embeds: [embed]
        });
    }
}
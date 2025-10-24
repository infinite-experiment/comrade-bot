import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";
import { DeploymentService } from "../services/deploymentService";

export const data = new SlashCommandBuilder()
    .setName("rollout")
    .setDescription("[GOD MODE] Redeploy slash commands")
    .addStringOption(option =>
        option
            .setName("mode")
            .setDescription("Deployment mode")
            .setRequired(true)
            .addChoices(
                { name: "🏠 Local (this server only - instant)", value: "local" },
                { name: "🌍 Global (all servers - takes ~1 hour)", value: "global" }
            )
    );

/**
 * Rollout command - redeploys all slash commands
 * Supports both local (guild-specific) and global deployment
 * Restricted to god-mode users only
 */
export async function execute(interaction: DiscordInteraction) {
    const chatInput = interaction.getChatInputInteraction();
    if (!chatInput) return;

    // Get deployment mode
    const mode = chatInput.options.getString("mode", true) as "local" | "global";

    // Defer reply as this might take a few seconds
    await chatInput.deferReply({ ephemeral: true });

    try {
        // Verify god-mode access via backend
        const isGod = await ApiService.verifyGodMode(interaction.getMetaInfo());

        if (!isGod) {
            await chatInput.editReply({
                content: "❌ **Permission Denied**\n\nThis command requires god mode (system administrator) access."
            });
            return;
        }

        let result;

        if (mode === "local") {
            // Local deployment to current guild
            const guildId = chatInput.guildId;

            if (!guildId) {
                await chatInput.editReply({
                    content: "❌ **Error**\n\nLocal deployment requires this command to be used in a server, not in DMs."
                });
                return;
            }

            console.log(`[Rollout] LOCAL deployment to guild ${guildId} by user ${chatInput.user.id}`);
            result = await DeploymentService.deployToGuild(guildId);

        } else {
            // Global deployment to all servers
            console.log(`[Rollout] GLOBAL deployment by user ${chatInput.user.id}`);
            result = await DeploymentService.deployGlobally();
        }

        if (!result.success) {
            await chatInput.editReply({
                content: `❌ **Deployment Failed**\n\n${result.message}\n\nCheck bot logs for details.`
            });
            return;
        }

        // Build success embed
        const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("✅ Commands Deployed Successfully")
            .setDescription(`Deployed ${result.commandCount} slash commands.`)
            .addFields(
                {
                    name: "📋 Commands",
                    value: result.commandNames.map(name => `\`/${name}\``).join(", "),
                    inline: false
                }
            );

        if (mode === "local") {
            successEmbed.addFields(
                {
                    name: "🎯 Scope",
                    value: `Local (Guild: ${result.guildId})`,
                    inline: true
                },
                {
                    name: "⚡ Availability",
                    value: "Immediate",
                    inline: true
                }
            );
        } else {
            successEmbed.addFields(
                {
                    name: "🎯 Scope",
                    value: "Global (all servers)",
                    inline: true
                },
                {
                    name: "⏳ Availability",
                    value: "Up to 1 hour",
                    inline: true
                }
            );
            successEmbed.setFooter({ text: "Global commands may take up to 1 hour to propagate" });
        }

        successEmbed.setTimestamp();

        await chatInput.editReply({
            embeds: [successEmbed]
        });

        console.log(`[Rollout] Successfully deployed ${result.commandCount} commands (${mode} mode)`);

    } catch (error: any) {
        console.error("[Rollout] Failed to deploy commands:", error);

        const errorMessage = error?.message || "Unknown error occurred";

        await chatInput.editReply({
            content: `❌ **Deployment Failed**\n\n${errorMessage}\n\nCheck bot logs for details.`
        });
    }
}

export default {
    data,
    execute
};

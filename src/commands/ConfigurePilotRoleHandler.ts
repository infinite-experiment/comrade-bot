import { ApiService } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";

export async function execute(interaction: DiscordInteraction, userId: string, selectedRole: string): Promise<void> {

    const meta = interaction.getMetaInfo();

    try {
        const result = await ApiService.assignUserRole(meta, {
            user_id: userId,
            role: selectedRole,
        });

        if (result.status === "error") {
            await interaction.editReply({
                content: `❌ Failed to assign role:\n\`${result.message || result.error || "Unknown error"}\``,
            });
            return;
        }

        await interaction.editReply({
            content: `✅ Role \`${selectedRole}\` assigned successfully to <@${userId}>.`,
        });
    } catch (err) {
        console.error("[SetUserRoleModalHandler.execute]", err);
        await interaction.editReply({
            content: "An unexpected error occurred while assigning the role.",
        });
    }
}

export const ConfigurePilotRoleHandler = {
    execute,
};
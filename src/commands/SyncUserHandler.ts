import { ApiService, SyncUserPayload } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";

export async function execute(interaction: DiscordInteraction): Promise<void> {
    const modal = interaction.getModalInputInteraction();
    if (!modal) return;

    try {
        const meta = interaction.getMetaInfo();

        const callsign = modal.fields.getTextInputValue("callsign").trim();
        if (!callsign) {
            await modal.reply({
                content: "Callsign is required.",
            });
            return;
        }

        // Extract user ID from modal.customId — format: "SYNC_USER_MODAL_<userId>"
        const parts = modal.customId.split("_");
        const mentionedUserId = parts[3]; // 0 = "SYNC", 1 = "USER", 2 = "MODAL", 3 = userId

        if (!mentionedUserId) {
            await modal.reply({
                content: "Something went wrong. Unable to determine which user to sync.",
            });
            return;
        }

        const payload: SyncUserPayload = {
            user_id: mentionedUserId,
            callsign: callsign,
        };

        const result = await ApiService.syncUserToVA(meta, payload);
        if (result.status == "error") {
            if (result.status === "error") {
                await interaction.reply({
                    content: `❌ Failed to sync user:\n\`${result.message || result.error || "Unknown error"}\``,
                });
                return;
            }
        }
        await modal.reply({
            content: `✅ ${result.status || "User synced successfully"}`,
        });
    } catch (err) {
        console.error("[SyncUserModalHandler]", err);
        await interaction.reply({
            content: "An unexpected error occurred while syncing user.",
        });
    }
}


export const SyncUserModalHandler = {
    execute,
};

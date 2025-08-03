import { CUSTOM_IDS } from "../configs/constants";
import { ApiService } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { MessageFormatters } from "../helpers/messageFormatter";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

export const data = {
    name: CUSTOM_IDS.INIT_SERVER_MODAL
}

/* ──────────────────────────────────────────────────────────
   Modal submission handler (validate prefix/suffix)
   ────────────────────────────────────────────────────────── */
export async function execute(
    interaction: DiscordInteraction
) {
    const _interaction = interaction.getModalInputInteraction();
    if (!_interaction) {
        return;
    }
    if (_interaction.customId !== CUSTOM_IDS.INIT_SERVER_MODAL) return;

    const vaId = _interaction.fields.getTextInputValue("vaId").trim();
    const vaName = _interaction.fields.getTextInputValue("vaName").trim();

    /* TODO: call your backend to persist the VA details
        await api.
        ({ vaId, prefix, suffix, discordServerId: interaction.guildId! });
    */


    try {
        const initRegistration = await ApiService.initiateServerRegistration(
            interaction.getMetaInfo(),
            vaId,
            vaName
        );

        if (!initRegistration.data) {
            await interaction.reply({
                content: "❌ Empty response from API.",
                ephemeral: true,
            });
            return;
        }

        await interaction.reply(
            MessageFormatters.makeRegistrationString(initRegistration.data)
        );

    } catch (e) {
        console.error("[initiateServerRegistration]", e);

        if (e instanceof UnauthorizedError) {
            await interaction.reply({
                content: `❌ You are not authorized to perform this action.\n${e.message}`,
                ephemeral: true,
            });
            return;
        }

        await interaction.reply({
            content: "❌ An unexpected error occurred during server registration.",
            ephemeral: true,
        });
    }


}


export default {
    execute,
    data
}
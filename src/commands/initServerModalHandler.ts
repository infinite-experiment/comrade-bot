import { CUSTOM_IDS } from "../configs/constants";
import { ApiService } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { MessageFormatters } from "../helpers/messageFormatter";

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
    const prefix = _interaction.fields.getTextInputValue("csPrefix").trim();
    const suffix = _interaction.fields.getTextInputValue("csSuffix").trim();

    // enforce: at least one of prefix / suffix required
    if (!prefix && !suffix) {
        await interaction.reply({
            content: "❌  Either a callsign **prefix** or **suffix** must be provided.",
            ephemeral: true,
        });
        return;
    }

    /* TODO: call your backend to persist the VA details
        await api.
        ({ vaId, prefix, suffix, discordServerId: interaction.guildId! });
    */

    try {
        const initRegistration = await ApiService.initiateServerRegistration(interaction.getMetaInfo(), vaId, vaName, prefix, suffix);

        if (!initRegistration.data) {
        await interaction.reply({
            content: "❌  Empty response from API.",
            ephemeral: true,
        });
        return;
        }

        await interaction.reply(
        MessageFormatters.makeRegistrationString(initRegistration.data)   // <── OK
        );
    } catch (e) {
        await interaction.reply({ content: "❌  No data returned.", ephemeral: true });
        return;

    }

}


export default {
    execute,
    data
}
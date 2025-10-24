import { CUSTOM_IDS } from "../configs/constants";
import { ApiService } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { MessageFormatters } from "../helpers/messageFormatter";
import { CommandErrorHandler, ValidationPatterns } from "../helpers/commandErrorHandler";

export const data = {
    name: CUSTOM_IDS.INIT_SERVER_MODAL
}

/**
 * Handles server initialization modal submission
 * Validates VA code and name, then registers server via API
 */
export async function execute(interaction: DiscordInteraction) {
    const _interaction = interaction.getModalInputInteraction();
    if (!_interaction) return;

    if (_interaction.customId !== CUSTOM_IDS.INIT_SERVER_MODAL) return;

    // Extract inputs
    const vaCode = _interaction.fields.getTextInputValue("vaCode").trim().toUpperCase();
    const vaName = _interaction.fields.getTextInputValue("vaName").trim();
    const callsignPrefix = _interaction.fields.getTextInputValue("callsignPrefix")?.trim() || "";
    const callsignSuffix = _interaction.fields.getTextInputValue("callsignSuffix")?.trim() || "";

    // Validate VA code
    if (!await CommandErrorHandler.validateInput(
        interaction, vaCode, "VA code", ValidationPatterns.VA_CODE, 3, 5
    )) return;

    // Validate VA name
    if (!await CommandErrorHandler.validateInput(
        interaction, vaName, "VA name", undefined, 3, 50
    )) return;

    // Validate at least one callsign pattern is provided
    if (!callsignPrefix && !callsignSuffix) {
        await interaction.reply({
            content: "❌ **Validation Error**\nYou must provide at least a Callsign Prefix or Suffix for flight matching.",
            ephemeral: true
        });
        return;
    }

    // Log execution
    CommandErrorHandler.logExecution("Server Init", _interaction.user.id, _interaction.guildId, {
        vaCode,
        vaName,
        callsignPrefix,
        callsignSuffix
    });
 
    try {
        const response = await ApiService.initiateServerRegistration(
            interaction.getMetaInfo(),
            vaCode,
            vaName,
            callsignPrefix,
            callsignSuffix
        );

        // Check if response contains data
        if (!response?.data) {
            // If response has a message but no data, it's an error response
            if (response?.message) {
                await interaction.reply({
                    content: `❌ **Server Registration Failed**\n${response.message}`,
                    ephemeral: true
                });
                return;
            }
            await CommandErrorHandler.handleEmptyResponse(interaction);
            return;
        }

        // Send success response
        await interaction.reply(
            MessageFormatters.makeRegistrationString(response.data)
        );

    } catch (error) {
        await CommandErrorHandler.handleApiError(interaction, error, "Server Init");
    }
}

export default {
    execute,
    data
}

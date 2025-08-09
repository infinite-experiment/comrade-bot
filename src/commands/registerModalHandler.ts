import { ModalSubmitInteraction } from "discord.js";
import { ApiService } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { CUSTOM_IDS } from "../configs/constants";
import { MessageFormatters } from "../helpers/messageFormatter";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

export const data = {
    name: CUSTOM_IDS.REGISTER_MODAL
}

export async function execute(interaction: DiscordInteraction) {
    const _interaction = interaction.getModalInputInteraction()
    if (!_interaction)
        return;
    const ifcId = _interaction.fields.getTextInputValue('ifcId');
    const lastFlight = _interaction.fields.getTextInputValue('lastFlight');

    if (!ifcId) {
        await interaction.reply("Invalid IFC ID encountered");
        return;
    }
    console.log("\n==========================\n", ifcId, lastFlight)

    try {
        const initRegistration = await ApiService.initiateRegistration(
            interaction.getMetaInfo(),
            ifcId,
            lastFlight
        );

        await interaction.reply(
            MessageFormatters.makeRegistrationString(initRegistration)
        );
        return;
    } catch (err) {
        console.error("[initiateRegistration]", err);

        if (err instanceof UnauthorizedError) {
            await interaction.reply({
                content: `❌ You are not authorized to register.\n${err.message}`,
            });
            return;
        }

        await interaction.reply(genericErrorMessage());
    }
    await interaction.reply(genericErrorMessage());
    return

}

function genericErrorMessage(): string {
    return "⚠️ Something went wrong while processing your registration. Please try again later or contact support.";
}


export default {
    data,
    execute
};
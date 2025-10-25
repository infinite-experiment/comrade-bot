import {
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
} from "discord.js";
import { CUSTOM_IDS } from "../configs/constants";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";

/**
 * Handles the "Proceed with Registration" button for new users
 * Shows modal with IFC ID, last flight, and optional callsign
 */
export async function handleRegisterNew(interaction: DiscordInteraction) {
    const buttonInteraction = interaction.getButtonInteraction();
    if (!buttonInteraction) return;

    // Check if this server is a registered VA
    // We do this by calling getUserDetails - if it returns data OR a specific user error,
    // it means the server is registered. If it's an auth/server error, server is not a VA.
    let isVAServer = false;
    try {
        await ApiService.getUserDetails(interaction.getMetaInfo());
        // If call succeeds, server is definitely a VA (user might or might not be registered)
        isVAServer = true;
    } catch (error: any) {
        // Check error message/status to differentiate between:
        // - User not found (server is VA, but user not registered) -> still VA server
        // - Server auth failure (server is not a VA) -> not VA server
        const errorMessage = error?.message?.toLowerCase() || "";
        const isUserNotFoundError =
            errorMessage.includes("user") ||
            errorMessage.includes("not found") ||
            errorMessage.includes("404");

        // If it's a user-related error, server is still a VA
        // If it's an auth/server error (401, 403, server not found), server is not a VA
        isVAServer = isUserNotFoundError;
    }

    // Build modal fields
    const ifcIdInput = new TextInputBuilder()
        .setCustomId("ifcId")
        .setLabel("IFC Username")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("john_doe123")
        .setRequired(true)
        .setMinLength(3)
        .setMaxLength(30);

    const lastFlightInput = new TextInputBuilder()
        .setCustomId("lastFlight")
        .setLabel("Last Valid Flight (ICAO-ICAO)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("KJFK-EGLL")
        .setRequired(true)
        .setMinLength(9)
        .setMaxLength(9);

    const modal = new ModalBuilder()
        .setCustomId(CUSTOM_IDS.REGISTER_MODAL)
        .setTitle("Register to Comrade Bot");

    const components: ActionRowBuilder<TextInputBuilder>[] = [
        new ActionRowBuilder<TextInputBuilder>().addComponents(ifcIdInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(lastFlightInput),
    ];

    // Add callsign field if this is a VA server
    if (isVAServer) {
        const callsignInput = new TextInputBuilder()
            .setCustomId("callsign")
            .setLabel("Callsign Number (Optional, 1-5 digits)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("001")
            .setRequired(false)
            .setMinLength(1)
            .setMaxLength(5);

        components.push(
            new ActionRowBuilder<TextInputBuilder>().addComponents(callsignInput)
        );
    }

    modal.addComponents(...components);

    await buttonInteraction.showModal(modal);
}

/**
 * Handles the "Link to VA" button for registered users who want to link to a VA
 * Shows modal with only callsign field
 */
export async function handleRegisterLink(interaction: DiscordInteraction) {
    const buttonInteraction = interaction.getButtonInteraction();
    if (!buttonInteraction) return;

    // Build modal with only callsign field
    const callsignInput = new TextInputBuilder()
        .setCustomId("callsign")
        .setLabel("Callsign Number (1-5 digits)")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder("001")
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(5);

    const modal = new ModalBuilder()
        .setCustomId("register_link_modal")
        .setTitle("Link to Virtual Airline");

    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(callsignInput)
    );

    await buttonInteraction.showModal(modal);
}

export default {
    handleRegisterNew,
    handleRegisterLink
};

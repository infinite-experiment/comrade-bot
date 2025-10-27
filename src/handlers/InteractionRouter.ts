import { Interaction } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { CUSTOM_IDS } from "../configs/constants";
import { ApiService } from "../services/apiService";

// Import handlers
import RegisterHandler from "../commands/registerModalHandler";
import InitServerHandler from "../commands/initServerModalHandler";
import { handleInitServerProceed } from "../commands/initServerButtonHandler";
import { handleRegisterNew, handleRegisterLink } from "../commands/registerButtonHandler";
import { ConfigurePilotRoleHandler } from "../commands/ConfigurePilotRoleHandler";
import { SyncUserModalHandler } from "../commands/SyncUserHandler";
import { handleFlightHistory } from "../commands/logbookHandler";
import { logModeSelectionHandler } from "../commands/logModeSelectionHandler";
import { commandMap } from "../configs/commandMap";

/**
 * Centralized interaction router
 * Handles all Discord interactions: commands, modals, buttons, select menus
 */
export class InteractionRouter {
    /**
     * Route incoming interaction to appropriate handler
     */
    static async route(rawInteraction: Interaction): Promise<void> {
        try {
            // Route based on interaction type
            if (rawInteraction.isStringSelectMenu()) {
                await this.handleSelectMenu(rawInteraction);
            } else if (rawInteraction.isModalSubmit()) {
                await this.handleModalSubmit(rawInteraction);
            } else if (rawInteraction.isButton()) {
                await this.handleButton(rawInteraction);
            } else if (rawInteraction.isChatInputCommand()) {
                await this.handleCommand(rawInteraction);
            }
        } catch (error) {
            console.error("[InteractionRouter] Error:", error);
            await this.handleError(rawInteraction, error);
        }
    }

    /**
     * Handle select menu interactions
     */
    private static async handleSelectMenu(interaction: Interaction): Promise<void> {
        if (!interaction.isStringSelectMenu()) return;

        const [prefix, section, tag, userId] = interaction.customId.split("_");

        // Route to pilot role configuration
        if (prefix === CUSTOM_IDS.SET_PILOT_ROLE_MODAL) {
            const selectedRole = interaction.values[0];
            await ConfigurePilotRoleHandler.execute(
                new DiscordInteraction(interaction),
                section,
                selectedRole
            );
        }
    }

    /**
     * Handle modal submit interactions
     */
    private static async handleModalSubmit(interaction: Interaction): Promise<void> {
        if (!interaction.isModalSubmit()) return;

        const wrapped = new DiscordInteraction(interaction);

        // Static modal handlers
        switch (interaction.customId) {
            case RegisterHandler.data.name:
                await RegisterHandler.execute(wrapped);
                break;

            case InitServerHandler.data.name:
                await InitServerHandler.execute(wrapped);
                break;

            case CUSTOM_IDS.LINK_PILOT_CONFIRM:
                await SyncUserModalHandler.execute(wrapped);
                break;

            case "register_link_modal":
                // Handle link-only registration (callsign-only modal)
                await RegisterHandler.execute(wrapped);
                break;

            default:
                // Check if it's a PIREP modal with encoded mode_id (format: pirepModal_modeId)
                if (interaction.customId.startsWith(CUSTOM_IDS.PIREP_MODAL)) {
                    await this.handlePirepModal(wrapped);
                } else {
                    // Dynamic modal handlers (with IDs)
                    await this.handleDynamicModal(interaction, wrapped);
                }
        }
    }

    /**
     * Handle dynamic modals with custom IDs containing parameters
     */
    private static async handleDynamicModal(
        interaction: Interaction,
        wrapped: DiscordInteraction
    ): Promise<void> {
        if (!interaction.isModalSubmit()) return;

        const [prefix, section, tag] = interaction.customId.split("_");
        const customId = `${prefix}_${section}_${tag}`;

        // Sync user modal
        if (customId === CUSTOM_IDS.SYNC_USER_MODAL) {
            await SyncUserModalHandler.execute(wrapped);
        }
    }

    /**
     * Handle button interactions
     */
    private static async handleButton(interaction: Interaction): Promise<void> {
        if (!interaction.isButton()) return;

        const wrapped = new DiscordInteraction(interaction);

        // Handle initserver proceed button
        if (interaction.customId === "initserver_proceed") {
            await handleInitServerProceed(wrapped);
            return;
        }

        // Handle register new user button
        if (interaction.customId === "register_new") {
            await handleRegisterNew(wrapped);
            return;
        }

        // Handle register link button (for users who need to link to VA)
        if (interaction.customId === "register_link") {
            await handleRegisterLink(wrapped);
            return;
        }

        // Handle PIREP mode selection buttons
        if (interaction.customId.startsWith(CUSTOM_IDS.PIREP_MODE_PREFIX)) {
            await logModeSelectionHandler(wrapped);
            return;
        }

        // Parse button custom ID: {prefix}_{action}_{param1}_{param2}
        const [prefix, action, ...params] = interaction.customId.split("_");

        // Flight history pagination
        if (prefix === "flights" && (action === "prev" || action === "next")) {
            const [ifcId, pageStr] = params;
            const page = parseInt(pageStr, 10);
            await handleFlightHistory(wrapped, page, ifcId);
        }
    }

    /**
     * Handle slash command interactions
     */
    private static async handleCommand(interaction: Interaction): Promise<void> {
        if (!interaction.isChatInputCommand()) return;

        console.log(`[Command] ${interaction.commandName} (Guild: ${interaction.guildId || 'DM'})`);

        const command = commandMap[interaction.commandName];
        if (!command) {
            console.warn(`[Command] Unknown command: ${interaction.commandName}`);
            return;
        }

        const wrapped = new DiscordInteraction(interaction);
        await command.execute(wrapped);
    }

    /**
     * Handle PIREP modal submission
     */
    private static async handlePirepModal(wrapped: DiscordInteraction): Promise<void> {
        const modalInteraction = wrapped.getModalInputInteraction();
        if (!modalInteraction) return;

        try {
            // Extract mode_id from modal custom ID (format: "pirepModal_modeId")
            const customIdParts = modalInteraction.customId.split('_');
            const modeId = customIdParts.slice(1).join('_'); // Handle mode IDs with underscores

            // Extract form data from modal
            const flightTime = modalInteraction.fields.getTextInputValue("flight_time");

            // Optional fields based on mode
            let routeId: string | undefined;
            let pilotRemarks: string | undefined;
            let fuelKg: number | undefined;
            let cargoKg: number | undefined;
            let passengers: number | undefined;

            try {
                routeId = modalInteraction.fields.getTextInputValue("route_id");
            } catch {
                // Route field not present in this mode
            }

            try {
                pilotRemarks = modalInteraction.fields.getTextInputValue("pilot_remarks");
            } catch {
                // Remarks not present
            }

            try {
                fuelKg = parseInt(modalInteraction.fields.getTextInputValue("fuel_kg"));
            } catch {
                // Fuel not present or invalid
            }

            try {
                cargoKg = parseInt(modalInteraction.fields.getTextInputValue("cargo_kg"));
            } catch {
                // Cargo not present or invalid
            }

            try {
                passengers = parseInt(modalInteraction.fields.getTextInputValue("passengers"));
            } catch {
                // Passengers not present or invalid
            }

            // Build summary with submitted PIREP data
            const summaryLines = [
                `**Mode:** ${modeId}`,
                ``,
                `**Flight Data:**`,
                `Flight Time: ${flightTime}`,
            ];

            if (routeId) summaryLines.push(`Route: ${routeId}`);
            if (pilotRemarks) summaryLines.push(`Remarks: ${pilotRemarks}`);
            if (fuelKg) summaryLines.push(`Fuel: ${fuelKg} kg`);
            if (cargoKg) summaryLines.push(`Cargo: ${cargoKg} kg`);
            if (passengers) summaryLines.push(`Passengers: ${passengers}`);

            // Build PIREP submission data
            const pirepData = {
                mode: modeId,
                route_id: routeId || undefined,
                flight_time: flightTime,
                pilot_remarks: pilotRemarks,
                fuel_kg: fuelKg,
                cargo_kg: cargoKg,
                passengers: passengers,
            };

            // Log the collected data
            console.log("[handlePirepModal] Submitting PIREP Data:", pirepData);

            // Defer the reply now that we have all data extracted
            // This will extend the interaction timeout while we call the API
            try {
                await modalInteraction.deferReply();
            } catch (deferErr) {
                console.error("[handlePirepModal] Failed to defer reply:", deferErr);
                // If defer fails, try replying directly instead
                try {
                    await modalInteraction.reply({
                        content: "⏳ Processing PIREP submission...",
                        flags: 64 // Ephemeral flag
                    });
                } catch (quickReplyErr) {
                    console.error("[handlePirepModal] Failed to send quick reply:", quickReplyErr);
                    return;
                }
            }

            // Call API to submit PIREP
            try {
                const metaInfo = wrapped.getMetaInfo();
                const submitResponse = await ApiService.submitPirep(metaInfo, pirepData);

                // Check if submission was successful (data.success flag)
                const responseData = submitResponse.data;
                if (!responseData || !responseData.success) {
                    console.error("[handlePirepModal] Submit failed:", submitResponse);
                    await modalInteraction.editReply({
                        embeds: [{
                            title: "❌ PIREP Submission Failed",
                            description: `Error: ${responseData?.error_message || submitResponse.message || "Unknown error occurred"}`,
                            color: 0xff0000,
                            timestamp: new Date().toISOString(),
                        }]
                    });
                    return;
                }

                // Show success response
                console.log("[handlePirepModal] PIREP submitted successfully:", submitResponse);

                await modalInteraction.editReply({
                    embeds: [{
                        title: "✅ PIREP Submitted Successfully",
                        description: summaryLines.join("\n"),
                        color: 0x00ff00,
                        timestamp: new Date().toISOString(),
                        fields: [
                            {
                                name: "PIREP ID",
                                value: responseData.pirep_id || "N/A",
                                inline: true
                            },
                            {
                                name: "Processing Time",
                                value: submitResponse.response_time || "N/A",
                                inline: true
                            }
                        ]
                    }]
                });
            } catch (submitErr) {
                console.error("[handlePirepModal] Submit API call failed:", submitErr);
                try {
                    await modalInteraction.editReply({
                        embeds: [{
                            title: "❌ PIREP Submission Error",
                            description: "Failed to submit PIREP to backend. Please try again later.",
                            color: 0xff0000,
                            timestamp: new Date().toISOString(),
                        }]
                    });
                } catch (editErr) {
                    console.error("[handlePirepModal] Failed to edit reply:", editErr);
                }
            }
        } catch (err) {
            console.error("[handlePirepModal]", err);
            try {
                await modalInteraction.reply({
                    content: `❌ An error occurred: ${String(err)}`,
                    flags: 64 // Ephemeral
                });
            } catch (replyErr) {
                console.error("[handlePirepModal] Failed to send error message:", replyErr);
            }
        }
    }

    /**
     * Handle errors gracefully
     */
    private static async handleError(interaction: Interaction, error: unknown): Promise<void> {
        console.error("[InteractionRouter] Error details:", error);

        const errorMessage = {
            content: "⚠️ An unexpected error occurred. Please try again later.",
            ephemeral: true
        };

        try {
            if (interaction.isRepliable()) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(errorMessage);
                } else {
                    await interaction.reply(errorMessage);
                }
            }
        } catch (replyError) {
            console.error("[InteractionRouter] Failed to send error message:", replyError);
        }
    }
}

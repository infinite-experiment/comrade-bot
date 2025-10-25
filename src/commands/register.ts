import {
    ActionRowBuilder,
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";

export const data = new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register to Comrade Bot and link to your Virtual Airline");

/**
 * Shows registration info screen with proceed button
 * Checks user status first to show contextual message and appropriate action
 */
export async function execute(interaction: DiscordInteraction) {
    const chatInput = interaction.getChatInputInteraction();
    if (!chatInput) return;

    // Check user's current status
    let userDetails;
    try {
        userDetails = await ApiService.getUserDetails(interaction.getMetaInfo());
    } catch (error) {
        // User not registered or API error - continue with new user registration flow
        console.log("[Register] User details fetch failed, assuming new user:", error);
    }

    const isRegistered = userDetails?.is_active || false;
    const isLinkedToVA = userDetails?.current_va?.is_member || false;

    // SCENARIO 1: User is already registered AND linked to this VA
    if (isRegistered && isLinkedToVA && userDetails) {
        const successEmbed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle("✅ Already Registered & Linked!")
            .setDescription(`You're all set up!`)
            .addFields(
                {
                    name: "📝 IFC Username",
                    value: userDetails.if_community_id,
                    inline: true
                },
                {
                    name: "🎖️ Role",
                    value: userDetails.current_va.role.charAt(0).toUpperCase() + userDetails.current_va.role.slice(1),
                    inline: true
                }
            )
            .setFooter({ text: "Use /help to learn how to use Comrade Bot • Contact staff to update callsign" });

        await chatInput.reply({
            embeds: [successEmbed],
            ephemeral: true
        });
        return;
    }

    // SCENARIO 2: User is registered but NOT linked to this VA
    if (isRegistered && !isLinkedToVA && userDetails) {
        const linkEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle("🔗 Link to Virtual Airline")
            .setDescription(`You're registered as **${userDetails.if_community_id}**, but not yet linked to this Virtual Airline.`)
            .addFields(
                {
                    name: "What you need:",
                    value: "• Your **callsign number** (1-5 digits)\n• This combines with the VA's prefix/suffix pattern",
                    inline: false
                },
                {
                    name: "Example",
                    value: "If the VA suffix is `VA` and you enter `001`, flights ending with `001VA` or `001 VA` will be tracked.",
                    inline: false
                },
                {
                    name: "📌 Note",
                    value: "Callsign can only be set once. Contact staff if you need to change it later.",
                    inline: false
                }
            )
            .setFooter({ text: "Click 'Link to VA' to proceed" });

        // Create link button
        const linkButton = new ButtonBuilder()
            .setCustomId("register_link")
            .setLabel("Link to VA")
            .setStyle(ButtonStyle.Primary)
            .setEmoji("🔗");

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(linkButton);

        await chatInput.reply({
            embeds: [linkEmbed],
            components: [row],
            ephemeral: true
        });
        return;
    }

    // SCENARIO 3: User is NOT registered - show new registration flow
    await showNewUserRegistration(chatInput);
}

/**
 * Shows new user registration info and button
 */
async function showNewUserRegistration(chatInput: any) {
    const infoEmbed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("✈️ User Registration")
        .setDescription("Register with Comrade Bot to access your flight data and Virtual Airline features.")
        .addFields(
            {
                name: "📝 IFC Username (Required)",
                value: "Your Infinite Flight Community username.\nExample: `john_doe123`, `pilot_jane`\n\n" +
                    "⚠️ **Important:** Use your IFC username, NOT your display name!",
                inline: false
            },
            {
                name: "🛫 Last Valid Flight (Required)",
                value: "Your most recent flight with both **origin** and **destination** airports.\n" +
                    "Format: `ORIGIN-DESTINATION` (4-letter ICAO codes)\n" +
                    "Example: `KJFK-EGLL`, `VABB-OMDB`\n\n" +
                    "⚠️ **Must be a completed flight from your logbook!**",
                inline: false
            },
            {
                name: "🔢 Callsign Number (Optional - VA Members Only)",
                value: "If this Discord server is a **registered Virtual Airline**, you can link your pilot profile.\n\n" +
                    "**Your callsign number** (usually 1-5 digits): `001`, `123`, `1234`\n" +
                    "This combines with your VA's prefix/suffix to form your full callsign.\n\n" +
                    "Example: If VA suffix is `VA` and your number is `001`, flights with callsign ending in `001VA` or `001 VA` will be tracked.\n\n" +
                    "📌 *If not provided now, ask a staff member to update it later.*",
                inline: false
            },
        )
        .setFooter({ text: "Click 'Proceed' to continue with registration" });

    // Create proceed button for new registration
    const proceedButton = new ButtonBuilder()
        .setCustomId("register_new")
        .setLabel("Proceed with Registration")
        .setStyle(ButtonStyle.Success)
        .setEmoji("✅");

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(proceedButton);

    await chatInput.reply({
        embeds: [infoEmbed],
        components: [row],
        ephemeral: true
    });
}
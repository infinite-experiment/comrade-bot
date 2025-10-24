// src/commands/initServer.ts
import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { CUSTOM_IDS } from "../configs/constants";
import { DiscordInteraction } from "../types/DiscordInteraction";

/* ──────────────────────────────────────────────────────────
   /initserver slash command metadata
   ────────────────────────────────────────────────────────── */
export const data = new SlashCommandBuilder()
  .setName("initserver")
  .setDescription("Initialise this Discord server with VA details");

/* ──────────────────────────────────────────────────────────
   Slash command → show info screen with button
   ────────────────────────────────────────────────────────── */
export async function execute(interaction: DiscordInteraction) {
  const chatInput = interaction.getChatInputInteraction();
  if (!chatInput) return;

  // Create info embed
  const infoEmbed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle("🏢 Initialize Virtual Airline Server")
    .setDescription("Please provide your Virtual Airline details to set up this Discord server.")
    .addFields(
      {
        name: "📝 VA Code (3-5 characters)",
        value: "A unique identifier for your virtual airline.\nExample: `AAVA`, `DAL`, `UAE`",
        inline: false
      },
      {
        name: "✈️ VA Name",
        value: "The full name of your virtual airline.\nExample: `Air India Virtual`, `Delta Virtual Airlines`",
        inline: false
      },
      {
        name: "🔖 Callsign Prefix (Optional)",
        value: "The text that appears **before** the flight number in pilot callsigns.\nExample: If pilots use `Air India 001VA`, the prefix is `Air India`",
        inline: false
      },
      {
        name: "🔖 Callsign Suffix (Optional)",
        value: "The text that appears **after** the flight number in pilot callsigns.\nExample: If pilots use `Air India 001VA`, the suffix is `VA`\nIf pilots use `<Livery> 001 AI`, the suffix is `AI`",
        inline: false
      },
      {
        name: "💡 Callsign Pattern Examples",
        value:
          "**Example 1:** `Air India 001VA`\n" +
          "→ Prefix: `Air India`, Suffix: `VA`\n\n" +
          "**Example 2:** `<Any Livery> 001 AI`\n" +
          "→ Prefix: (empty), Suffix: `AI`\n\n" +
          "**Example 3:** `DAL 123`\n" +
          "→ Prefix: `DAL`, Suffix: (empty)\n\n" +
          "*The system will match all live flights with callsigns containing your prefix/suffix pattern.*",
        inline: false
      }
    )
    .setFooter({ text: "Click 'Proceed' to fill in your VA details" });

  // Create proceed button
  const proceedButton = new ButtonBuilder()
    .setCustomId("initserver_proceed")
    .setLabel("Proceed")
    .setStyle(ButtonStyle.Primary)
    .setEmoji("▶️");

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(proceedButton);

  await chatInput.reply({
    embeds: [infoEmbed],
    components: [row],
    ephemeral: true
  });
}

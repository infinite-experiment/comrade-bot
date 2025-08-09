// src/commands/initServer.ts
import {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
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
   Slash command → show modal
   ────────────────────────────────────────────────────────── */
export async function execute(interaction: DiscordInteraction) {
  const vaIdInput = new TextInputBuilder()
    .setCustomId("vaId")
    .setLabel("VA unique ID (3–5 chars)")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setRequired(true)
    .setPlaceholder("AAVA");

  const vaNameInput = new TextInputBuilder()
    .setCustomId("vaName")
    .setLabel("VA Name")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(50)
    .setRequired(true)
    .setPlaceholder("Made Up Airlines Virtual");

  const modal = new ModalBuilder()
    .setCustomId(CUSTOM_IDS.INIT_SERVER_MODAL)
    .setTitle("Init server");

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(vaIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(vaNameInput),
  );

  const chatInput = interaction.getChatInputInteraction();
  if (chatInput) await chatInput.showModal(modal);
}

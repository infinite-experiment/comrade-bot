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
    console.log("IN INIT SERVER")
  const vaIdInput = new TextInputBuilder()
    .setCustomId("vaId")
    .setLabel("VA unique ID (3–4 chars)")
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(4)
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

  const csPrefixInput = new TextInputBuilder()
    .setCustomId("csPrefix")
    .setLabel("Callsign prefix (optional)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(10)
    .setRequired(false)
    .setPlaceholder("AVA");

  const csSuffixInput = new TextInputBuilder()
    .setCustomId("csSuffix")
    .setLabel("Callsign suffix (optional)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(10)
    .setRequired(false)
    .setPlaceholder("001");

  const modal = new ModalBuilder()
    .setCustomId(CUSTOM_IDS.INIT_SERVER_MODAL)
    .setTitle("Init server");

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(vaIdInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(vaNameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(csPrefixInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(csSuffixInput)
  );

  const chatInput = interaction.getChatInputInteraction();
  if (chatInput) await chatInput.showModal(modal);
}

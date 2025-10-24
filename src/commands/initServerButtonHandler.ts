import {
  ModalBuilder,
  TextInputBuilder,
  ActionRowBuilder,
  TextInputStyle,
  ButtonInteraction,
} from "discord.js";
import { CUSTOM_IDS } from "../configs/constants";
import { DiscordInteraction } from "../types/DiscordInteraction";

/**
 * Handles the "Proceed" button click for server initialization
 * Shows the modal with VA details form
 */
export async function handleInitServerProceed(interaction: DiscordInteraction) {
  const buttonInteraction = interaction.getButtonInteraction();
  if (!buttonInteraction) return;

  // Create modal with all VA fields
  const vaCodeInput = new TextInputBuilder()
    .setCustomId("vaCode")
    .setLabel("VA Code (3-5 characters)")
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
    .setPlaceholder("Air India Virtual");

  const callsignPrefixInput = new TextInputBuilder()
    .setCustomId("callsignPrefix")
    .setLabel("Callsign Prefix (Optional)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(30)
    .setRequired(false)
    .setPlaceholder("Air India");

  const callsignSuffixInput = new TextInputBuilder()
    .setCustomId("callsignSuffix")
    .setLabel("Callsign Suffix (Optional)")
    .setStyle(TextInputStyle.Short)
    .setMaxLength(30)
    .setRequired(false)
    .setPlaceholder("VA");

  const modal = new ModalBuilder()
    .setCustomId(CUSTOM_IDS.INIT_SERVER_MODAL)
    .setTitle("Initialize Virtual Airline");

  modal.addComponents(
    new ActionRowBuilder<TextInputBuilder>().addComponents(vaCodeInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(vaNameInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(callsignPrefixInput),
    new ActionRowBuilder<TextInputBuilder>().addComponents(callsignSuffixInput),
  );

  await buttonInteraction.showModal(modal);
}

export default {
  handleInitServerProceed
};

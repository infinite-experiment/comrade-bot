import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { CUSTOM_IDS } from "../configs/constants";

export const data = new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register to comrade bot")
    
export async function execute(interaction: DiscordInteraction) {


    const ifcIdInput = new TextInputBuilder()
        .setCustomId("ifcId")
        .setLabel("Enter your Infinite Flight Community Id")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('john_doe123')
        .setRequired(true);

    const lastFlightInput = new TextInputBuilder()
        .setCustomId("lastFlight")
        .setLabel("Enter Last VALID flt. from logbook")
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('KJFK-VABB')
        .setRequired(true)
        .setMinLength(9)
        .setMaxLength(9);

    const modal = new ModalBuilder()
        .setCustomId(CUSTOM_IDS.REGISTER_MODAL)
        .setTitle('Register for comrade bot');
    
    
    modal.addComponents(
        new ActionRowBuilder<TextInputBuilder>().addComponents(ifcIdInput),
        new ActionRowBuilder<TextInputBuilder>().addComponents(lastFlightInput)
        );

        const _interaction = interaction.getChatInputInteraction();
        if(_interaction)
            await _interaction.showModal(modal);
        // Read IFC ID

}
import {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    ActionRowBuilder,
    TextInputStyle,
    User,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import { CUSTOM_IDS } from "../configs/constants";
import { DiscordInteraction } from "../types/DiscordInteraction";

export const data = new SlashCommandBuilder()
    .setName("pilotmanage")
    .setDescription("Staff-only: Onboard a pilot or manage their role")
    .addStringOption(option =>
        option
            .setName("function")
            .setDescription("What do you want to do?")
            .setRequired(true)
            .addChoices(
                { name: "Sync User (link pilot to Airtable)", value: "sync_user" },
                { name: "Set Role (update permissions)", value: "set_role" }
            )
    )
    .addUserOption(option =>
        option
            .setName("target_user")
            .setDescription("Select the pilot to manage")
            .setRequired(true)
    );

export async function execute(interaction: DiscordInteraction): Promise<void> {
    const chatInput = interaction.getChatInputInteraction();
    if (!chatInput) {
        return;
    }

    const selectedFn = chatInput.options.getString("function", true);
    const user = chatInput.options.getUser("target_user", true);


    switch (selectedFn) {
        case "sync_user": {
            const modal = new ModalBuilder()
                .setCustomId(`${CUSTOM_IDS.SYNC_USER_MODAL}_${user.id}`) // include user ID in modal ID
                .setTitle("Link Pilot to Airtable");

            const callsignInput = new TextInputBuilder()
                .setCustomId("callsign")
                .setLabel("Pilot's Callsign (e.g. YZVA011)")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder<TextInputBuilder>().addComponents(callsignInput)
            );

            await chatInput.showModal(modal);
            break;
        }

        case "set_role": {
            const roleSelect = new StringSelectMenuBuilder()
                .setCustomId(`${CUSTOM_IDS.SET_PILOT_ROLE_MODAL}_${user.id}`)
                .setPlaceholder("Select a role for the user")
                .setMinValues(1)
                .setMaxValues(1)
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Pilot")
                        .setValue("pilot"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Staff")
                        .setValue("staff"),
                );

            const menuRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(roleSelect);

            await interaction.reply({
                content: `Please select a role to assign to <@${user.id}>`,
                components: [menuRow],
            });
            break;

        }

        default:
            await chatInput.reply({
                content: "Unknown action.",
            });
    }
}

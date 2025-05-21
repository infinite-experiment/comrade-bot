import { SlashCommandBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ApiService } from "../services/apiService";

export const data = new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register to comrade bot")
    .addStringOption(opt => opt
        .setName("ifc_id")
        .setRequired(true)
        .setDescription("Your Infinite Flight Community Id")
    )

export async function execute(interaction: DiscordInteraction) {
    // Read IFC ID
    const ifcId = interaction.getInteraction().options.getString("ifc_id");

    if(!ifcId){
        await interaction.reply("Invalid IFC ID encountered");
        return;
    }

    try{
        const initRegistration = await ApiService.initiateRegistration(interaction.getMetaInfo(), ifcId);
        console.log(initRegistration);
    } catch(err) {
        console.log(err);
    }

    await interaction.reply("Interaction failed. Please try again");
    return
}
import { MessageFormatters } from "../helpers/messageFormatter";
import { ApiService } from "../services/apiService";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, MessageFlags } from "discord.js";

export async function handleFlightHistory(
  interaction: DiscordInteraction,
  page: number,
  ifcId = ""
) {
    // await interaction.deferReply(true)
    if(interaction.isChatInputCommand() && ifcId === "")
        ifcId = interaction.getStringParam("ifc_id", true);

  // Fetch from your API
  const data =await ApiService.getUserLogbook(interaction.getMetaInfo(), ifcId, page)

  // Compose message
  const content = "```" + MessageFormatters.makeFlightHistoryTable(data.records) + "```";

  // Setup buttons
  const components: ActionRowBuilder<ButtonBuilder>[] = [];
  const buttonRow = new ActionRowBuilder<ButtonBuilder>();

  if (page > 1)
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`flights_prev_${ifcId}_${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary)
    );

  if (data.records.length > 0) // Or check apiResp.data.hasNextPage if you have it
    buttonRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`flights_next_${ifcId}_${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary)
    );

  if (buttonRow.components.length > 0)
    components.push(buttonRow);


  // Respond or update
  await interaction.reply({
     components, 
     content: MessageFormatters.makeFlightHistoryTable(data.records),
     flags: MessageFlags.Ephemeral
    });
  
}

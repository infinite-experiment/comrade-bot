/**
 * flightHistoryHandler.ts  – wrapper-aware
 */

import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Client,
  Interaction,
  MessageFlags,
} from "discord.js";

import { ApiService } from "../services/apiService";
import { renderFlightHistory } from "../helpers/TableRenderer";
import { DiscordInteraction } from "../types/DiscordInteraction";
import { MessageFormatters } from "../helpers/messageFormatter";
import { FlightHistoryPage } from "../types/Responses";
import { UnauthorizedError } from "../helpers/UnauthorizedException";

// ────────────────────────────────────────────────
// Main worker
// ────────────────────────────────────────────────
export async function handleFlightHistory(
  di: DiscordInteraction,
  page: number,
  ifcId = "",
): Promise<void> {
  const chat = di.getChatInputInteraction();
  const btn = di.getButtonInteraction();

  if (!chat && !btn) return;                  // ignore other interactions
  const fromSlash = !!chat;

  // ── 1) IFC-ID (first page only) ─────────────────
  if (fromSlash && !ifcId) {
    ifcId = di.getStringParam("ifc_id", true);
  }

  // ── 2) ACK once ────────────────────────────────
  if (fromSlash) {
    await chat!.deferReply({ flags: MessageFlags.Ephemeral });
  } else {
    await btn!.deferUpdate();
  }

  // ── 3) Fetch data ──────────────────────────────
  // const apiResp = await ApiService.getUserLogbook(di.getMetaInfo(), ifcId, page);

  let apiResp: FlightHistoryPage = { records: [], page: 0, error: "" };  // fallback shape

  try {
    apiResp = await ApiService.getUserLogbook(di.getMetaInfo(), ifcId, page);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      const msg = `❌ You're not authorized to view this logbook.\n${err.message}`;
      if (fromSlash) await chat!.editReply(msg);
      else await btn!.followUp({ content: msg, flags: MessageFlags.Ephemeral });
      return;
    }

    console.error("Unexpected error while fetching logbook:", err);
    const msg = "❌ Unexpected error while fetching logbook.";
    if (fromSlash) await chat!.editReply(msg);
    else await btn!.followUp({ content: msg, flags: MessageFlags.Ephemeral });
    return;
  }

  if (!apiResp?.records?.length) {
    const msg = "❌ No flight history found for the provided IFC ID.";
    if (fromSlash) await chat!.editReply(msg);
    else await btn!.followUp({ content: msg, flags: MessageFlags.Ephemeral });
    return;
  }

  // ── 4) Render PNG ──────────────────────────────
  const png = await renderFlightHistory(apiResp.records);
  const file = new AttachmentBuilder(png, { name: "logbook.png" });
  const msg = MessageFormatters.makeFlightHistoryTable(apiResp.records)

  // ── 5) Pagination buttons ──────────────────────
  const row = new ActionRowBuilder<ButtonBuilder>();
  if (page > 1) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`flights_prev_${ifcId}_${page - 1}`)
        .setLabel("Previous")
        .setStyle(ButtonStyle.Primary),
    );
  }
  if (apiResp.records.length) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`flights_next_${ifcId}_${page + 1}`)
        .setLabel("Next")
        .setStyle(ButtonStyle.Primary),
    );
  }

  const editPayload = {
    files: [file],
    content: msg,
    components: row.components.length ? [row] : [],
  } as const;

  // ── 6) Edit / update exactly once ───────────────
  if (fromSlash) {
    await chat!.editReply(editPayload);
  } else {
    await btn!.editReply(editPayload);
  }
}

// ────────────────────────────────────────────────
// Router
// ────────────────────────────────────────────────
export function registerLogbookHandlers(client: Client): void {
  client.on("interactionCreate", async (raw: Interaction) => {
    const di = new DiscordInteraction(raw as any);

    try {
      // Slash
      if (raw.isChatInputCommand() && raw.commandName === "logbook") {
        return handleFlightHistory(di, 1);
      }

      // Button
      const btn = di.getButtonInteraction();
      if (btn) {
        const m = btn.customId.match(/^flights_(prev|next)_(\\d+)_(\\d+)$/);
        if (!m) return;
        const [, , ifcId, pageStr] = m;
        return handleFlightHistory(di, Number(pageStr), ifcId);
      }
    } catch (err) {
      console.error("logbook handler error", err);
      if (raw.isRepliable() && !raw.replied && !raw.deferred) {
        await raw.reply({ content: "Unexpected error while fetching logbook.", flags: MessageFlags.Ephemeral });
      }
    }
  });
}

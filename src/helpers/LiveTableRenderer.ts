import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { CanvasTable } from "canvas-table";
import { LiveFlightRecord } from "../types/Responses";

// ──────────────────────────────────────────────────────────────
// Constants / styles
// ──────────────────────────────────────────────────────────────

const FONT_FAMILY = "DejaVu Sans Mono";
const FONT = `14px '${FONT_FAMILY}'`;

const BG_HEADER = "#313244";
const FG_HEADER = "#cdd6f4";
const BG_ROW = "#1e1e2e";
const BG_STRIPE = "#2a2b3d";
const FG_TEXT = "#f5e0dc";
const BORDER_COLOUR = "#45475a";
// Pre‑register font (safe‑fail) ------------------------------------------------
try {
    GlobalFonts.registerFromPath(
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        FONT_FAMILY,
    );
} catch { }

// ──────────────────────────────────────────────────────────────
// Helper: ISO timestamp → relative time ("2m ago")
// ──────────────────────────────────────────────────────────────
function fmtTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;

    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

// Helper: Get color based on how stale the data is
function getStaleColor(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return FG_TEXT;

    const mins = Math.floor((Date.now() - d.getTime()) / 60000);

    if (mins > 10) return "#f38ba8"; // Red - very stale
    if (mins > 5) return "#fab387";  // Orange - getting stale
    return "#a6e3a1"; // Green - fresh
}

// ──────────────────────────────────────────────────────────────
// Main API
// ──────────────────────────────────────────────────────────────

export async function renderLiveFlights(records: LiveFlightRecord[], responseTimeMs?: number): Promise<Buffer> {
    console.log(`[renderLiveFlights] Starting render for ${records.length} flights`);
    if (!records.length) throw new Error("No flights to render");

    const header = ["Callsign", "User", "Aircraft", "Alt", "Spd", "From", "To", "Seen"];

    const dataRows = records.map(r => [
        r.callsign,
        r.username,
        `${r.aircraft} · ${r.livery}`,
        `${r.altitude} ft`,
        `${r.speed} kts`,
        r.origin,
        r.destination,
        fmtTime(r.lastReport),
    ]);

    // Store lastReport for color coding
    const lastReports = records.map(r => r.lastReport);

    // Measure column widths
    const ctxMeasure = createCanvas(10, 10).getContext("2d");
    ctxMeasure.font = FONT;
    const colWidths = header.map((_, col) =>
        Math.ceil(
            Math.max(
                ctxMeasure.measureText(header[col]).width,
                ...dataRows.map(row => ctxMeasure.measureText(row[col]).width)
            ) + 16
        )
    );

    const tableW = colWidths.reduce((a, b) => a + b, 0);

    // Estimate table height (canvas-table will determine actual height)
    // Row height = fontSize * lineHeight + padding*2
    const estimatedRowH = Math.ceil(14 * 1.5 + 8 * 2);
    const tableH = estimatedRowH * (dataRows.length + 1);
    const footerH = 50;
    const totalH = tableH + footerH;

    const canvas = createCanvas(tableW, totalH);
    const ctx = canvas.getContext("2d");

    // Fill background with dark color first
    ctx.fillStyle = BG_ROW;
    ctx.fillRect(0, 0, tableW, totalH);

    // Format data with color coding for "Seen" column and alternating row backgrounds
    const styledData = dataRows.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
            // Alternating row background
            const rowBackground = rowIndex % 2 === 0 ? BG_ROW : BG_STRIPE;

            // Color code the "Seen" column (index 7) based on staleness
            if (colIndex === 7 && rowIndex < lastReports.length) {
                return {
                    value: cell,
                    color: getStaleColor(lastReports[rowIndex]),
                    background: rowBackground
                };
            }
            return {
                value: cell,
                color: FG_TEXT,
                background: rowBackground
            };
        })
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const ct = new CanvasTable(canvas as unknown as any, {
        columns: header.map((title, i) => ({
            title,
            options: {
                minWidth: colWidths[i],
                maxWidth: colWidths[i]
            }
        })),
        data: styledData,
        options: {
            background: BG_ROW,
            borders: {
                header: { width: 1, color: BORDER_COLOUR },
                row: { width: 1, color: BORDER_COLOUR },
                table: { width: 1, color: BORDER_COLOUR }
            },
            header: {
                background: BG_HEADER,
                color: FG_HEADER,
                fontFamily: FONT_FAMILY,
                fontSize: 14,
                fontWeight: "bold",
                padding: 8,
                lineHeight: 1.5
            },
            cell: {
                color: FG_TEXT,
                background: BG_ROW,
                fontFamily: FONT_FAMILY,
                fontSize: 14,
                fontWeight: "normal",
                padding: 8,
                lineHeight: 1.5
            },
            fit: false,
            padding: 0
        }
    } as any);

    await ct.generateTable();

    // Draw footer with metadata
    const footerBgHeight = footerH;
    const footerStart = tableH + 2; // Small gap after table
    ctx.fillStyle = "#181825"; // Darker footer background
    ctx.fillRect(0, footerStart, tableW, footerBgHeight);

    // Separator line
    ctx.fillStyle = "#45475a";
    ctx.fillRect(0, footerStart, tableW, 2);

    ctx.font = "bold 13px 'DejaVu Sans Mono'";
    ctx.fillStyle = "#cdd6f4"; // Brighter text
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    let footerText = `${records.length} active flight${records.length !== 1 ? 's' : ''} • Updated at ${timeStr}`;
    if (responseTimeMs !== undefined) {
        footerText += ` • API: ${responseTimeMs}ms`;
    }

    ctx.fillText(footerText, 15, footerStart + 26);

    return canvas.encode("png");
}

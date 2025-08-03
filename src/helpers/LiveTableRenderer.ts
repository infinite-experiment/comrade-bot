import { createCanvas, GlobalFonts } from "@napi-rs/canvas";
import { CanvasTable } from "canvas-table";
import { LiveFlightRecord } from "../types/Responses";

// ──────────────────────────────────────────────────────────────
// Constants / styles
// ──────────────────────────────────────────────────────────────

const ROW_H = 28;
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
// Helper: ISO timestamp → "HH:MM"
// ──────────────────────────────────────────────────────────────
function fmtTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toISOString().slice(11, 16); // HH:MM
}

// ──────────────────────────────────────────────────────────────
// Main API
// ──────────────────────────────────────────────────────────────

export async function renderLiveFlights(records: LiveFlightRecord[]): Promise<Buffer> {
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
    const tableH = ROW_H * (dataRows.length + 1);

    const canvas = createCanvas(tableW, tableH);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    const ct = new CanvasTable(canvas as unknown as any, {
        fontFamily: FONT_FAMILY,
        fontSize: 14,
        rowHeight: ROW_H,
        lineWidth: 1,
        borderColor: BORDER_COLOUR,
        headerBackground: BG_HEADER,
        headerColor: FG_HEADER,
        stripBackground1: BG_ROW,
        stripBackground2: BG_STRIPE,
        columns: header.map((title, i) => ({ title, width: colWidths[i] })),
        data: dataRows,
        drawCellHook: ({ ctx, row }: any) => {
            if (!row.isHeader) {
                ctx.fillStyle = FG_TEXT;
            }
        },
    } as any);


    await ct.generateTable();
    return canvas.encode("png");
}

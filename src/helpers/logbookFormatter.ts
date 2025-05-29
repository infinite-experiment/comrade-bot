import { EmbedBuilder, hyperlink } from 'discord.js'; // Assuming you have discord.js v14+
import { FlightHistoryRecord } from '../types/Responses';

// Helper function to pad strings to a fixed length
function padRight(str: string, length: number): string {
    return str.padEnd(length, ' ');
}

// Helper function to truncate strings if they exceed a max length
function truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.substring(0, maxLength - 1) + '…' : str;
}

export class FlightHistoryTable {
    private static readonly SERVER_COL_WIDTH = 6; // "Server"
    private static readonly TIMESTAMP_COL_WIDTH = 16; // "YYYY-MM-DD HH:MM"
    private static readonly ROUTE_COL_WIDTH = 9; // "AAA-BBB" or "?-?" (already fixed 9 chars)
    private static readonly EQUIPMENT_COL_WIDTH = 17; // "AAAA (LLLLLLLL)"
    private static readonly LANDINGS_COL_WIDTH = 8; // "Landings"

    // The maximum number of rows for the table
    private static readonly MAX_ROWS = 10;

    public static makeFlightHistoryEmbed(records: FlightHistoryRecord[]): EmbedBuilder {
        if (records.length === 0) {
            return new EmbedBuilder()
                .setColor(0xFFA500) // Orange for warning/info
                .setTitle('Flight History')
                .setDescription('No flight history records found.');
        }

        // Only take the first MAX_ROWS records
        const limitedRecords = records.slice(0, this.MAX_ROWS);

        let tableContent = '';

        // Table header
        tableContent +=
            `| ${padRight('Server', this.SERVER_COL_WIDTH)} ` +
            `| ${padRight('Timestamp', this.TIMESTAMP_COL_WIDTH)} ` +
            `| ${padRight('Route', this.ROUTE_COL_WIDTH)} ` +
            `| ${padRight('Equipment', this.EQUIPMENT_COL_WIDTH)} ` +
            `| ${padRight('Landings', this.LANDINGS_COL_WIDTH)} |\n`;

        // Separator line
        tableContent +=
            `|${'-'.repeat(this.SERVER_COL_WIDTH + 2)}` +
            `|${'-'.repeat(this.TIMESTAMP_COL_WIDTH + 2)}` +
            `|${'-'.repeat(this.ROUTE_COL_WIDTH + 2)}` +
            `|${'-'.repeat(this.EQUIPMENT_COL_WIDTH + 2)}` +
            `|${'-'.repeat(this.LANDINGS_COL_WIDTH + 2)}|\n`;

        // Format each row
        for (const rec of limitedRecords) {
            // Format timestamp: show only up to minutes
            const date = new Date(rec.timestamp);
            const timeStr = date.toISOString().slice(0, 16).replace("T", " ");

            // Equipment string with caps
            const aircraft = truncate(rec.aircraft, 4).toUpperCase();
            const livery = truncate(rec.livery, 8);
            const equipment = `${aircraft} (${livery})`;

            // Route string, with hyperlink if mapUrl is set
            let route = `${rec.origin || "?"}-${rec.dest || "?"}`;
            // Discord's hyperlink markdown doesn't work inside code blocks for alignment
            // So, we'll decide how to handle mapUrl. For now, we'll just show the route.
            // If the user clicks the mapUrl, consider adding it in the footer or a separate message.

            // Add the row, ensuring all parts are padded to their defined width
            tableContent +=
                `| ${padRight(rec.server, this.SERVER_COL_WIDTH)} ` +
                `| ${padRight(timeStr, this.TIMESTAMP_COL_WIDTH)} ` +
                `| ${padRight(route, this.ROUTE_COL_WIDTH)} ` +
                `| ${padRight(equipment, this.EQUIPMENT_COL_WIDTH)} ` +
                `| ${padRight(String(rec.landings), this.LANDINGS_COL_WIDTH)} |\n`;
        }

        // Wrap the entire table in a code block
        const finalTableString = `\`\`\`\n${tableContent}\`\`\``;

        const embed = new EmbedBuilder()
            .setColor(0x0099FF) // A nice blue color
            .setTitle('Flight History Records')
            .setDescription(finalTableString)
            .setFooter({ text: `Showing ${limitedRecords.length} of ${records.length} total records.` });
            
        // You could add the map URL as a separate field if it's consistently available and important
        // e.g., if (records.some(r => r.mapUrl)) { embed.addFields({ name: 'Map Links', value: 'See individual flight entries for map links.'}); }

        return embed;
    }
}
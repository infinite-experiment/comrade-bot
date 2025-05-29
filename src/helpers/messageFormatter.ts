import { AlignmentEnum, AsciiTable3 } from "ascii-table3";
import { FlightHistoryRecord, HealthApiResponse, InitRegistrationResponse } from "../types/Responses";

export class MessageFormatters {
    static generateHealthString(data: HealthApiResponse) : string {
        if (!data) return "No data.";
        let msg = `**Status:** ${data.status.toUpperCase()}\n**Uptime:** ${data.uptime}\n\n**Services:**\n`;
        for (const [svc, status] of Object.entries(data.services)) {
          msg += `- **${svc}**: ${status.status.toUpperCase()}`;
          if (status.details) msg += ` (${status.details})`;
          msg += `\n`;
        }
        return msg;
    }

    static makeRegistrationString(resp: InitRegistrationResponse) : string{
      const header = resp.status
          ? `✅ Registration successful for **${resp.ifc_id}**`
          : `❌ Registration failed for **${resp.ifc_id}**`;

      const mainMsg = resp.message ? `${resp.message}` : '';

      const stepsMsg =
          resp.steps && resp.steps.length
              ? resp.steps.map(
                    (s) =>
                        `${s.status ? '✅' : '❌'} **${s.name}:** ${s.message}`
                ).join('\n')
              : '';

      return [header, mainMsg, stepsMsg].filter(Boolean).join('\n\n');

    }
    
  static makeFlightHistoryTable(records: FlightHistoryRecord[]): string {
    if (records.length === 0) return "No flights found.";

    const table = new AsciiTable3()
      .setHeading('Time', 'Route', 'Equip', 'L/V/S', 'Map');

    for (const rec of records) {
      // Format: Jan 8,20:03
      const start = new Date(rec.timestamp);
      const timeStr = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(start).replace(",", "");

      const route = `${rec.origin}-${rec.dest}`;
      const equip = rec.equipment;
      const lvs = `${rec.landings}/${getViolations(rec)}/${shortenServer(rec.server)}`;
      const mapLink = '[🔗]';

      table.addRow(timeStr, route, equip, lvs, mapLink);
    }

    // Align the 'L/V/S' column to center
    table.setAlign(3, AlignmentEnum.CENTER);

    const header = '```';
    const footer = '```\nL - Landings | V - Violations | S - Server (E - Expert, C - Casual, T - Training)\n';

    const links = true ? "" :records
      .map(
        (rec) =>
          `🔗 ${rec.origin}-${rec.dest} (${rec.callsign}) → ${rec.mapUrl}`
      )
      .join("\n");

    return `${header}\n${table.toString()}\n${footer}\n${links}`;
  }

}


function shortenServer(server: string): string {
  const s = server.toLowerCase();
  if (s.includes("expert")) return "E";
  if (s.includes("casual")) return "C";
  if (s.includes("training")) return "T";
  return "?";
}

// You can enhance this later if you add violations to the data
function getViolations(rec: FlightHistoryRecord): number {
  // Placeholder — update this when violations are available in the record
  return rec.violations;
}

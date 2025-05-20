import { HealthApiResponse } from "../types/Responses";

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
}
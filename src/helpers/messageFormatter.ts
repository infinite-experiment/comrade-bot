import { HealthApiResponse, InitRegistrationResponse } from "../types/Responses";

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
}
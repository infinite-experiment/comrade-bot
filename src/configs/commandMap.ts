import * as status from "../commands/status";
import * as register from "../commands/register";
import * as logbook from "../commands/logbook";
import * as initserver from "../commands/initServer";
import * as live from "../commands/live";
import { DiscordInteraction } from "../types/DiscordInteraction";

export type CommandHandler = {
    execute: (interaction: DiscordInteraction) => Promise<void>;
}

export const commandMap: Record<string, CommandHandler> = {
    status,
    register,
    logbook,
    initserver,
	live
}

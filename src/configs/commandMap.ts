import * as status from "../commands/status";
import * as register from "../commands/register";
import { DiscordInteraction } from "../types/DiscordInteraction";

export type CommandHandler = {
    execute: (interaction: DiscordInteraction) => Promise<void>;
}

export const commandMap: Record<string, CommandHandler> = {
    status,
    register
}
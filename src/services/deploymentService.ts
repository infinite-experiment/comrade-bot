import { REST, Routes } from "discord.js";
import { getCommandsJSON, getCommandNames } from "../utils/commandLoader";

/**
 * Service for deploying Discord slash commands
 */
export class DeploymentService {
    private static clientId: string;
    private static token: string;

    /**
     * Initialize the deployment service with bot credentials
     */
    static initialize(clientId: string, token: string) {
        this.clientId = clientId;
        this.token = token;
    }

    /**
     * Deploy commands to a specific guild
     * @param guildId - The Discord guild/server ID
     * @returns Object with deployment results
     */
    static async deployToGuild(guildId: string): Promise<DeploymentResult> {
        if (!this.clientId || !this.token) {
            throw new Error("DeploymentService not initialized. Call initialize() first.");
        }

        try {
            const commands = getCommandsJSON();
            const commandNames = getCommandNames();

            const rest = new REST().setToken(this.token);
            const route = Routes.applicationGuildCommands(this.clientId, guildId);

            console.log(`[DeploymentService] Deploying ${commands.length} commands to guild ${guildId}`);

            const deployedCommands = await rest.put(route, { body: commands }) as any[];

            console.log(`[DeploymentService] Successfully deployed ${deployedCommands.length} commands`);

            return {
                success: true,
                commandCount: deployedCommands.length,
                commandNames,
                guildId,
                scope: "guild",
                message: `Successfully deployed ${deployedCommands.length} commands`
            };

        } catch (error: any) {
            console.error("[DeploymentService] Deployment failed:", error);

            return {
                success: false,
                commandCount: 0,
                commandNames: [],
                guildId,
                scope: "guild",
                message: error?.message || "Unknown deployment error",
                error
            };
        }
    }

    /**
     * Deploy commands globally (takes ~1 hour to propagate)
     */
    static async deployGlobally(): Promise<DeploymentResult> {
        if (!this.clientId || !this.token) {
            throw new Error("DeploymentService not initialized. Call initialize() first.");
        }

        try {
            const commands = getCommandsJSON();
            const commandNames = getCommandNames();

            const rest = new REST().setToken(this.token);
            const route = Routes.applicationCommands(this.clientId);

            console.log(`[DeploymentService] Deploying ${commands.length} commands globally`);

            const deployedCommands = await rest.put(route, { body: commands }) as any[];

            console.log(`[DeploymentService] Successfully deployed ${deployedCommands.length} commands globally`);

            return {
                success: true,
                commandCount: deployedCommands.length,
                commandNames,
                scope: "global",
                message: `Successfully deployed ${deployedCommands.length} commands globally (may take up to 1 hour to propagate)`
            };

        } catch (error: any) {
            console.error("[DeploymentService] Global deployment failed:", error);

            return {
                success: false,
                commandCount: 0,
                commandNames: [],
                scope: "global",
                message: error?.message || "Unknown deployment error",
                error
            };
        }
    }
}

export interface DeploymentResult {
    success: boolean;
    commandCount: number;
    commandNames: string[];
    guildId?: string;
    scope: "guild" | "global";
    message: string;
    error?: any;
}

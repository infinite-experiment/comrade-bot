import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { getCommandsJSON, validateCommands, getCommandNames } from "./utils/commandLoader";

dotenv.config();

/**
 * Deploy slash commands to Discord
 * Supports both guild-specific (dev) and global (prod) deployment
 *
 * Usage:
 *   npm run deploy              - Deploy to guild if GUILD_ID is set, otherwise global
 *   npm run deploy:local        - Deploy to guild (requires GUILD_ID)
 *   npm run deploy:global       - Deploy globally to all servers
 */
async function deployCommands() {
    // Validate environment variables
    const clientId = process.env.DISCORD_BOT_CLIENT_ID;
    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.GUILD_ID;

    if (!clientId) {
        console.error("❌ DISCORD_BOT_CLIENT_ID is not set");
        process.exit(1);
    }

    if (!token) {
        console.error("❌ DISCORD_BOT_TOKEN is not set");
        process.exit(1);
    }

    // Check for deployment mode from command line arguments
    const args = process.argv.slice(2);
    const mode = args[0]; // 'local' or 'global'

    try {
        // Validate commands before deploying
        validateCommands();

        const commands = getCommandsJSON();
        const rest = new REST().setToken(token);

        console.log(`\n📦 Deploying ${commands.length} slash commands...`);
        console.log(`📋 Commands: ${getCommandNames().join(", ")}`);

        // Determine deployment scope
        let route;
        let scope;

        if (mode === "global") {
            // Force global deployment
            route = Routes.applicationCommands(clientId);
            scope = "Global (all servers)";
            console.log("🌍 Mode: GLOBAL deployment");
        } else if (mode === "local" || guildId) {
            // Guild-specific deployment (instant, great for dev)
            if (!guildId) {
                console.error("❌ GUILD_ID environment variable is required for local deployment");
                process.exit(1);
            }
            route = Routes.applicationGuildCommands(clientId, guildId);
            scope = `Guild: ${guildId}`;
            console.log("🏠 Mode: LOCAL (guild-specific) deployment");
        } else {
            // Default to global if no mode specified and no guild ID
            route = Routes.applicationCommands(clientId);
            scope = "Global (all servers)";
            console.log("🌍 Mode: GLOBAL deployment (default)");
        }

        console.log(`🎯 Scope: ${scope}`);

        // Deploy commands
        const data = await rest.put(route, { body: commands }) as any[];

        console.log(`\n✅ Successfully deployed ${data.length} commands!`);

        if (mode === "global" || !guildId) {
            console.log("⏳ Note: Global commands may take up to 1 hour to update across all servers");
        } else {
            console.log("⚡ Guild commands are available immediately!");
        }

    } catch (error) {
        console.error("\n❌ Failed to deploy commands:", error);
        process.exit(1);
    }
}

// Run deployment
deployCommands();

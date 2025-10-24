import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { getCommandsJSON, validateCommands, getCommandNames } from "./utils/commandLoader";

dotenv.config();

/**
 * Deploy slash commands to Discord
 * Supports both guild-specific (dev) and global (prod) deployment
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

        if (guildId) {
            // Guild-specific deployment (instant, great for dev)
            route = Routes.applicationGuildCommands(clientId, guildId);
            scope = `Guild: ${guildId}`;
        } else {
            // Global deployment (takes ~1 hour to propagate, use for prod)
            route = Routes.applicationCommands(clientId);
            scope = "Global";
        }

        console.log(`🎯 Scope: ${scope}`);

        // Deploy commands
        const data = await rest.put(route, { body: commands }) as any[];

        console.log(`\n✅ Successfully deployed ${data.length} commands!`);

        if (!guildId) {
            console.log("⏳ Note: Global commands may take up to 1 hour to update");
        }

    } catch (error) {
        console.error("\n❌ Failed to deploy commands:", error);
        process.exit(1);
    }
}

// Run deployment
deployCommands();

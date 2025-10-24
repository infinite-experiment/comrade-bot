import * as dotenv from "dotenv";
import { BotClient } from "./bot/BotClient";

// Load environment variables
dotenv.config();

/**
 * Main entry point for Comrade Bot
 */
async function main() {
    // Validate required environment variables
    const botToken = process.env.DISCORD_BOT_TOKEN;
    const clientId = process.env.DISCORD_BOT_CLIENT_ID;

    if (!botToken) {
        console.error("❌ DISCORD_BOT_TOKEN is not set in environment variables");
        process.exit(1);
    }

    if (!clientId) {
        console.error("❌ DISCORD_BOT_CLIENT_ID is not set in environment variables");
        process.exit(1);
    }

    // Initialize and start bot
    const bot = new BotClient(botToken, clientId);

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n🛑 Received SIGINT signal");
        await bot.stop();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("\n🛑 Received SIGTERM signal");
        await bot.stop();
        process.exit(0);
    });

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
        console.error("❌ Uncaught Exception:", error);
        process.exit(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
        console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });

    // Start the bot
    await bot.start();
}

// Run the bot
main().catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
});

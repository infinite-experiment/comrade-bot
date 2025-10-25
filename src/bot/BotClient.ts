import { Client, GatewayIntentBits, Events } from "discord.js";
import { InteractionRouter } from "../handlers/InteractionRouter";
import { DeploymentService } from "../services/deploymentService";

/**
 * Bot client manager
 * Handles Discord client initialization and lifecycle
 */
export class BotClient {
    private client: Client;
    private token: string;
    private clientId: string;

    constructor(token: string, clientId: string) {
        this.token = token;
        this.clientId = clientId;
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });

        // Initialize deployment service
        DeploymentService.initialize(clientId, token);

        this.setupEventHandlers();
    }

    /**
     * Setup Discord event handlers
     */
    private setupEventHandlers(): void {
        // Bot ready event
        this.client.once(Events.ClientReady, async (client) => {
            console.log(`✅ Bot logged in as ${client.user.tag}`);

            // Wait a bit for guild cache to populate
            await new Promise(resolve => setTimeout(resolve, 1000));

            const guildCount = client.guilds.cache.size;
            console.log(`📊 Serving ${guildCount} guild${guildCount !== 1 ? 's' : ''}`);

            if (guildCount === 0) {
                console.warn("⚠️  No guilds found. Make sure the bot is invited to at least one server.");
            }
        });

        // Interaction events
        this.client.on(Events.InteractionCreate, async (interaction) => {
            await InteractionRouter.route(interaction);
        });

        // Error handling
        this.client.on(Events.Error, (error) => {
            console.error("[Discord Error]", error);
        });

        this.client.on(Events.Warn, (warning) => {
            console.warn("[Discord Warning]", warning);
        });

        // Debug events (optional - remove in production)
        if (process.env.DEBUG === "true") {
            this.client.on(Events.Debug, (info) => {
                console.debug("[Discord Debug]", info);
            });
        }
    }

    /**
     * Start the bot
     */
    async start(): Promise<void> {
        try {
            console.log("🚀 Starting bot...");
            await this.client.login(this.token);
        } catch (error) {
            console.error("❌ Failed to start bot:", error);
            throw error;
        }
    }

    /**
     * Stop the bot gracefully
     */
    async stop(): Promise<void> {
        console.log("🛑 Stopping bot...");
        this.client.destroy();
    }

    /**
     * Get the Discord client instance
     */
    getClient(): Client {
        return this.client;
    }
}

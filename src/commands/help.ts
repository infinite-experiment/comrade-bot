import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { DiscordInteraction } from "../types/DiscordInteraction";

export const data = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with Comrade Bot commands")
    .addStringOption(option =>
        option
            .setName("command")
            .setDescription("Specific command to get help with")
            .setRequired(false)
            .addChoices(
                { name: "register", value: "register" },
                { name: "status", value: "status" },
                { name: "logbook", value: "logbook" },
                { name: "log", value: "log" },
                { name: "live", value: "live" },
                { name: "stats", value: "stats" },
                { name: "initserver", value: "initserver" }
            )
    );

export async function execute(interaction: DiscordInteraction) {
    const chat = interaction.getChatInputInteraction();
    if (!chat) return;

    const commandOption = chat.options.getString("command");

    if (!commandOption) {
        // Show general help overview
        await chat.reply({
            embeds: [getGeneralHelpEmbed()],
            ephemeral: true
        });
    } else {
        // Show specific command help
        const commandHelp = getCommandHelp(commandOption);
        if (commandHelp) {
            await chat.reply({
                embeds: [commandHelp],
                ephemeral: true
            });
        } else {
            await chat.reply({
                content: `❌ No help found for command: \`/${commandOption}\``,
                ephemeral: true
            });
        }
    }
}

/**
 * General overview of all commands
 */
function getGeneralHelpEmbed(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("🤖 Comrade Bot Help")
        .setDescription("Welcome to Comrade Bot! Here's what you can do:")
        .addFields(
            {
                name: "📝 User Registration",
                value: "• `/register` - Register with the bot and link to your Virtual Airline",
                inline: false
            },
            {
                name: "✅ Status & Information",
                value: "• `/status` - Check your registration and VA membership status\n" +
                       "• `/stats` - View your pilot statistics and activity",
                inline: false
            },
            {
                name: "✈️ Flight Logging",
                value: "• `/log` - File a PIREP for your current flight\n" +
                       "• `/logbook <ifc_id>` - View flight history (Staff/Admin only)\n" +
                       "• `/live` - View active flights in real-time\n" +
                       "• Web **Dashboard** - Interactive flight maps with altitude visualization",
                inline: false
            },
            {
                name: "🏢 Server Management",
                value: "• `/initserver` - Initialize your Discord server with VA details (Admin only)",
                inline: false
            },
            {
                name: "📖 Need More Help?",
                value: "Use `/help <command>` to learn more about a specific command!\n" +
                       "Example: `/help register`",
                inline: false
            }
        )
        .setFooter({ text: "Use /status to check your role and permissions" });
}

/**
 * Command-specific help embeds
 */
function getCommandHelp(command: string): EmbedBuilder | null {
    const helpMap: Record<string, EmbedBuilder> = {
        register: getRegisterHelp(),
        status: getStatusHelp(),
        logbook: getLogbookHelp(),
        log: getLogHelp(),
        live: getLiveHelp(),
        stats: getStatsHelp(),
        initserver: getInitserverHelp()
    };

    return helpMap[command] || null;
}

/**
 * /register command help
 */
function getRegisterHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle("📝 /register - User Registration")
        .setDescription("Register with Comrade Bot using your Infinite Flight Community account.")
        .addFields(
            {
                name: "🔄 What This Does",
                value: "• Creates your account with Comrade Bot\n" +
                       "• If the server is a registered VA, links you to that VA\n" +
                       "• Unlocks flight tracking and PIREP filing",
                inline: false
            },
            {
                name: "📋 What You Need",
                value: "**IFC Username** - Your Infinite Flight Community login\n" +
                       "**Last Flight** - Your most recent flight (e.g., `EGLL-KSEA`)\n" +
                       "**Callsign** (Optional) - 1-5 digits for the VA (e.g., `001`)",
                inline: false
            },
            {
                name: "⚠️ Important",
                value: "• Callsigns are locked after registration (staff can only change)\n" +
                       "• Registration is per-server",
                inline: false
            }
        )
        .setFooter({ text: "Run /register to get started" });
}

/**
 * /status command help
 */
function getStatusHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("✅ /status - Check Your Status")
        .setDescription("View your registration status, VA membership, and role in this server.")
        .addFields(
            {
                name: "🔄 What This Does",
                value: "• Shows if you're registered with the bot\n" +
                       "• Shows your VA membership status\n" +
                       "• Displays your role (Pilot, Staff, Admin)\n" +
                       "• Shows your IFC username and VA affiliation",
                inline: false
            },
            {
                name: "💡 Use Cases",
                value: "• Check if you're properly registered\n" +
                       "• Verify your role before using admin commands\n" +
                       "• Confirm your VA is set up correctly",
                inline: false
            },
            {
                name: "✅ Status Colors",
                value: "• 🟢 Green = Registered & linked to VA\n" +
                       "• 🟡 Orange = Registered but not linked\n" +
                       "• 🔴 Red = Not registered",
                inline: false
            }
        )
        .setFooter({ text: "Run /status anytime to check your status" });
}

/**
 * /logbook command help
 */
function getLogbookHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0xFF9900)
        .setTitle("📖 /logbook - View Flight History")
        .setDescription("View detailed flight history for any pilot. **Staff and Admin only.**")
        .addFields(
            {
                name: "👤 Who Can Use This?",
                value: "• **Staff** - VA managers and staff members\n" +
                       "• **Admin** - Server admin who registered the VA\n\n" +
                       "📌 Use `/status` to check your role in this server",
                inline: false
            },
            {
                name: "📋 Parameters",
                value: "**ifc_id** (Required)\n" +
                       "The pilot's Infinite Flight Community ID (username).\n" +
                       "Example: `/logbook john_doe123`",
                inline: false
            },
            {
                name: "🎯 Discord Features",
                value: "• **Flight Table** - All recorded flights with details\n" +
                       "• **Flight Details** - Date, route, aircraft, duration, violations\n" +
                       "• **Pagination** - Use Previous/Next buttons to browse\n" +
                       "• **Quick Route Links** - Direct links to recent flight maps",
                inline: false
            },
            {
                name: "🌐 Web Dashboard - Interactive Maps",
                value: "**Visit the web dashboard** to view detailed flight route maps with:\n" +
                       "• **Interactive Map** - Pan and zoom over the flight route\n" +
                       "• **Altitude Gradient** - Color-coded path (Green → Yellow → Red) based on altitude\n" +
                       "• **Flight Metadata** - Aircraft, duration, max speed, altitude, landings\n" +
                       "• **Route Legend** - Visual guide for altitude coloring (0 ft → 45k ft)\n\n" +
                       "After running `/logbook`, use the web app `/dashboard` command to explore flights interactively!",
                inline: false
            },
            {
                name: "❓ Common Issues",
                value: "**Permission Denied?**\n" +
                       "You need Staff or Admin role. Ask your VA admin to set this up.\n\n" +
                       "**No Flights Found?**\n" +
                       "The pilot may not be registered or have no flights recorded.\n\n" +
                       "**Wrong IFC ID?**\n" +
                       "Use the pilot's IFC Community username, not their display name.",
                inline: false
            },
            {
                name: "💡 Pro Tips",
                value: "• Use Discord `/logbook` for quick flight list browsing\n" +
                       "• Switch to web `/dashboard` for detailed map visualization\n" +
                       "• Altitude gradient helps identify climb, cruise, and descent phases\n" +
                       "• All flights cached for fast performance",
                inline: false
            }
        )
        .setFooter({ text: "Example: /logbook john_doe123 → Then use /dashboard for interactive maps" });
}

/**
 * /log command help
 */
function getLogHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x00FFFF)
        .setTitle("✈️ /log - File a PIREP")
        .setDescription("File a pilot report (PIREP) for your current flight. Registered pilots only.")
        .addFields(
            {
                name: "🔄 What This Does",
                value: "• Creates a flight report with your current flight data\n" +
                       "• Supports multiple flight modes (Classic, Career Mode, Flash Flight, etc.)\n" +
                       "• Logs flight time, route, fuel, cargo, passengers\n" +
                       "• Syncs with Airtable for VA record keeping",
                inline: false
            },
            {
                name: "⚠️ Requirements",
                value: "• You must be **registered** with `/register`\n" +
                       "• You must be **currently flying** in Infinite Flight\n" +
                       "• Your flight must match a **valid PIREP mode** for this VA",
                inline: false
            },
            {
                name: "🎯 Flight Modes",
                value: "Each VA configures which modes are available:\n" +
                       "• **Classic** - Standard flight logging\n" +
                       "• **Career Mode** - Career mode progression tracking\n" +
                       "• **Flash Flight** - Quick flight format\n" +
                       "• **Weekly Routes** - Special weekly challenge routes\n\n" +
                       "Your flight must match an eligible route for its mode.",
                inline: false
            },
            {
                name: "📝 Modal Form",
                value: "After selecting a mode, fill in:\n" +
                       "• **Flight Time** - Duration of your flight\n" +
                       "• **Route** (if required) - Origin-Destination\n" +
                       "• **Fuel** (if required) - Fuel consumed\n" +
                       "• **Cargo** (if required) - Cargo weight\n" +
                       "• **Passengers** (if required) - Number on board\n" +
                       "• **Remarks** (optional) - Notes about your flight",
                inline: false
            },
            {
                name: "❓ Troubleshooting",
                value: "**Not in Flight?**\n" +
                       "Join a flight in Infinite Flight and try again.\n\n" +
                       "**No Valid Modes?**\n" +
                       "Your current route isn't eligible for any configured modes.\n" +
                       "Check the route requirements with your VA staff.",
                inline: false
            }
        )
        .setFooter({ text: "You must be flying and registered to use this command" });
}

/**
 * /live command help
 */
function getLiveHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle("🛫 /live - View Live Flights")
        .setDescription("See all pilots currently flying for this Virtual Airline.")
        .addFields(
            {
                name: "🔄 What This Shows",
                value: "• List of active flights\n" +
                       "• Current altitude and speed\n" +
                       "• Aircraft type and route\n" +
                       "• Flight duration",
                inline: false
            },
            {
                name: "⚠️ Requirements",
                value: "• You must be **registered** with `/register`\n" +
                       "• You must be **linked to this VA**",
                inline: false
            },
            {
                name: "❓ Not Registered?",
                value: "Use `/register` to create your account and link to the VA.",
                inline: false
            }
        )
        .setFooter({ text: "Run /live to see active flights" });
}

/**
 * /stats command help
 */
function getStatsHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0x9900FF)
        .setTitle("📊 /stats - View Your Statistics")
        .setDescription("View your comprehensive pilot statistics including game stats, career mode data, and more.")
        .addFields(
            {
                name: "🎮 Game Statistics",
                value: "• **Flight Time** - Total time flying\n" +
                       "• **Online Flights** - Number of completed flights\n" +
                       "• **Landings** - Total successful landings\n" +
                       "• **XP** - Experience points accumulated\n" +
                       "• **Grade** - Your current grade in Infinite Flight\n" +
                       "• **Violations** - Total violations recorded",
                inline: false
            },
            {
                name: "✈️ Career Mode",
                value: "• **Airline & Aircraft** - Current assignment\n" +
                       "• **Total CM Hours** - Time in career mode\n" +
                       "• **Next Level Requirements** - Hours needed to progress\n" +
                       "• **Last Flight** - Most recent career mode flight\n" +
                       "• **Assigned Routes** - Number of available routes",
                inline: false
            },
            {
                name: "📋 VA Information",
                value: "• **Join Date** - When you joined\n" +
                       "• **Last Activity** - Most recent action\n" +
                       "• **Region** - Your assigned region\n" +
                       "• **Callsign** - Your VA callsign",
                inline: false
            },
            {
                name: "ℹ️ About Data",
                value: "• Stats are **cached and updated periodically**\n" +
                       "• Game stats pulled from Infinite Flight API\n" +
                       "• VA data synced from Airtable\n" +
                       "• Updates may lag by a few minutes\n" +
                       "• Cached indicator shown in response",
                inline: false
            },
            {
                name: "❓ Not Showing Stats?",
                value: "• Ensure you're **registered** with `/register`\n" +
                       "• Check you're **linked to a VA** with `/status`\n" +
                       "• Wait a few minutes for data to sync",
                inline: false
            }
        )
        .setFooter({ text: "Stats are cached - refresh times shown in response" });
}

/**
 * /initserver command help
 */
function getInitserverHelp(): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle("🏢 /initserver - Initialize Your VA Server")
        .setDescription("Set up your Discord server with Virtual Airline details. **Server Admin only.**")
        .addFields(
            {
                name: "👤 Who Can Use This?",
                value: "• Only the **server admin** (person who created the Discord server)\n" +
                       "• Or someone with **server administration** permissions\n\n" +
                       "📌 Use `/status` to verify you have admin role",
                inline: false
            },
            {
                name: "🔄 What This Does",
                value: "• Registers this Discord server with your Virtual Airline\n" +
                       "• Sets up pilot callsign patterns for flight matching\n" +
                       "• Configures available PIREP modes\n" +
                       "• Enables VA member commands and features",
                inline: false
            },
            {
                name: "📋 Information Needed",
                value: "**VA Code** (3-5 characters)\n" +
                       "Unique identifier. Example: `AAVA`, `DAL`, `UAE`\n\n" +
                       "**VA Name** (Full name)\n" +
                       "Example: `Air India Virtual`, `Delta Virtual Airlines`\n\n" +
                       "**Callsign Prefix** (Optional)\n" +
                       "Text before the number. Example: `Air India` in `Air India 001VA`\n\n" +
                       "**Callsign Suffix** (Optional)\n" +
                       "Text after the number. Example: `VA` in `Air India 001VA`",
                inline: false
            },
            {
                name: "💡 Callsign Pattern Examples",
                value: "• `Air India 001VA` → Prefix: `Air India`, Suffix: `VA`\n" +
                       "• `<Livery> 001 AI` → Prefix: (empty), Suffix: `AI`\n" +
                       "• `DAL 123` → Prefix: `DAL`, Suffix: (empty)",
                inline: false
            },
            {
                name: "⚠️ Important Notes",
                value: "• Only one admin per server\n" +
                       "• Settings apply to entire Discord server\n" +
                       "• Pilots register separately with `/register`\n" +
                       "• Once initialized, other features become available",
                inline: false
            }
        )
        .setFooter({ text: "Only the server admin can run this command" });
}

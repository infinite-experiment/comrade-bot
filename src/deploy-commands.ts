import { REST, Routes } from "discord.js";
import { data as statusCmd } from "./commands/status";
import { data as registerCmd } from "./commands/register";
import * as dotenv from "dotenv";

dotenv.config();
const commands = [
  statusCmd.toJSON(),
  registerCmd.toJSON()
];


const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN!);

(async () => {
  try {
    console.log("Registering slash commands...", process.env.GUILD_ID);
    const deployFunction = process.env.GUILD_ID ?
        // For global registration (slow to propagate; prefer for prod)
        Routes.applicationCommands(process.env.DISCORD_BOT_CLIENT_ID!) :
        // For single-guild (fast, great for dev):
        Routes.applicationGuildCommands(process.env.DISCORD_BOT_CLIENT_ID!, process.env.GUILD_ID!)
    await rest.put(
        deployFunction,
      { body: commands }
    );
    console.log("Registered successfully!");
  } catch (err) {
    console.error(err);
  }
})();

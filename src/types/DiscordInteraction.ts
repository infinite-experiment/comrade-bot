import { ChatInputCommandInteraction, InteractionReplyOptions } from "discord.js"

export class DiscordInteraction {
    public guildId: string | null;
    public userId: string
    private _interaction: ChatInputCommandInteraction

    constructor(interaction: ChatInputCommandInteraction) {
        this.guildId = interaction.guildId;
        this.userId = interaction.user.id;
        this._interaction = interaction;
    }

    public reply(message: InteractionReplyOptions | string) {
        this._interaction.reply(message);
    }

    public getMetaInfo() : MetaInfo {
        return {
            discordId: this.guildId ?? "",
            userId: this.userId
        }
    }

    public getInteraction(): ChatInputCommandInteraction{
        return this._interaction;
    }
};

export type CommandHandler = typeof status;


export type MetaInfo = {
    discordId: string;
    userId: string;
}
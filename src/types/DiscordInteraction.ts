import { ChatInputCommandInteraction, InteractionReplyOptions, ModalSubmitInteraction } from "discord.js"

type AnyInteraction = ChatInputCommandInteraction | ModalSubmitInteraction;

export class DiscordInteraction {
    public guildId: string | null;
    public userId: string
    private _interaction: AnyInteraction

    constructor(interaction: AnyInteraction) {
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

    public getChatInputInteraction(): ChatInputCommandInteraction | null{
        if(this._interaction.isChatInputCommand())
            return this._interaction as ChatInputCommandInteraction;
        return null;
    }

    public getModalInputInteraction(): ModalSubmitInteraction | null {
        if(this._interaction instanceof ModalSubmitInteraction)
            return this._interaction as ModalSubmitInteraction
        return null
    }
};

export type CommandHandler = typeof status;


export type MetaInfo = {
    discordId: string;
    userId: string;
}
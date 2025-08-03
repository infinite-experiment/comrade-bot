import { MetaInfo } from "../types/DiscordInteraction";

const API_KEY = process.env.API_KEY ?? "123"

export function generateMetaHeaders (metainfo: MetaInfo) {
    return {
        "X-Discord-Id": metainfo.userId,
        "X-Server-Id": metainfo.discordId,
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
}
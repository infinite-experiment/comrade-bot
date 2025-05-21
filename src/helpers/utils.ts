import { MetaInfo } from "../types/DiscordInteraction";

const API_KEY = process.env.API_KEY ?? "123"

export function generateMetaHeaders (metainfo: MetaInfo) {
    console.log(API_KEY)
    return {
        "X-Discord-Id": metainfo.discordId,
        "X-Server-Id": metainfo.userId,
        "X-API-Key": API_KEY,
        "Content-Type": "application/json"
    }
}
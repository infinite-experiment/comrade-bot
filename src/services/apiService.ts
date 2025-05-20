import fetch from "node-fetch";
import { HealthApiResponse } from "../types/Responses";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export class ApiService {
    static async getHealth(): Promise<HealthApiResponse> {
        try {
            const res = await fetch(`${API_URL}/healthCheck`);
            if (!res.ok) {
                throw new Error(`Failed to fetch healthCheck: ${res.status} ${res.statusText}`);
            }
            const data = await res.json() as HealthApiResponse;
            return data;
        } catch (err) {
            console.error("[ApiService.getHealth]", err);
            throw err;
        }
    }
}
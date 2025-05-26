import fetch from "node-fetch";
import { HealthApiResponse, InitRegistrationResponse, ApiResponse } from "../types/Responses";
import { MetaInfo } from "../types/DiscordInteraction";
import { generateMetaHeaders } from "../helpers/utils";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

export class ApiService {
    static async getHealth(metainfo: MetaInfo): Promise<HealthApiResponse> {
        try {
            const res = await fetch(`${API_URL}/healthCheck`, {
                method: "GET",
                headers: generateMetaHeaders(metainfo)
            });
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

    static async initiateRegistration(meta: MetaInfo, ifcId: string, lastFlight: string): Promise<InitRegistrationResponse> {
        try {
            const payload = JSON.stringify({ifc_id: ifcId, last_flight: lastFlight})
            const res = await fetch(`${API_URL}/api/v1/user/register/init`, {
                method: "POST",
                headers: generateMetaHeaders(meta),
                body: payload
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch initRegistration: ${res.status} ${res.statusText}`);
            }


            const response: ApiResponse<InitRegistrationResponse> = await res.json() as ApiResponse<InitRegistrationResponse>;

            if (!response.data) {
              throw new Error("No data received in API response");
            }
        
            return response.data;


            // const data = await res.json() as InitRegistrationResponse;
            // return data;
        } catch (err) {
            console.error("[ApiService.initRegistation]", err);
            throw err
        }
    }
}
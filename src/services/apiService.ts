import fetch from "node-fetch";
import { HealthApiResponse, InitRegistrationResponse, ApiResponse, FlightHistoryPage, InitServerResponse } from "../types/Responses";
import { MetaInfo } from "../types/DiscordInteraction";
import { generateMetaHeaders } from "../helpers/utils";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

type InitServerResult = ApiResponse<InitServerResponse>;

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
            const payload = JSON.stringify({ ifc_id: ifcId, last_flight: lastFlight })
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
        } catch (err) {
            console.error("[ApiService.initRegistation]", err);
            throw err
        }
    }

    // Change the return type so the caller gets the envelope for both 200 and 500

    static async initiateServerRegistration(
        meta: MetaInfo,
        code: string,
        name: string,
        prefix: string,
        suffix: string
    ): Promise<InitServerResult> {
        try {
            const res = await fetch(`${API_URL}/api/v1/server/init`, {
                method: "POST",
                headers: generateMetaHeaders(meta),
                body: JSON.stringify({ va_code: code, name, prefix, suffix }),
            });

            // const raw = await res.text();
            // console.log("RAW RESPONSE:\n", raw);

            // Always try to read the JSON body (success or error)
            const body: InitServerResult = await res.json() as InitServerResult;

            /*          ─── decide at the CALL-SITE ───
               - If res.ok === true  → body.status should be true.
               - If res.ok === false → body.status is false and body.data.steps
                                       tells which stage failed.                */
            return body;
        } catch (err) {
            // network/CORS/JSON issues
            console.error("[ApiService.initiateServerRegistration]", err);
            throw err;
        }
    }


    static async getUserLogbook(meta: MetaInfo, ifcId: string, page: number): Promise<FlightHistoryPage> {
        try {
            const res = await fetch(`${API_URL}/api/v1/user/${ifcId}/flights?page=${page}`, {
                method: "GET",
                headers: generateMetaHeaders(meta),
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch initRegistration: ${res.status} ${res.statusText}`);
            }


            const response: ApiResponse<FlightHistoryPage> = await res.json() as ApiResponse<FlightHistoryPage>;

            if (!response.data) {
                throw new Error("No data received in API response");
            }

            return response.data;


        } catch (err) {
            console.error("[ApiService.getLogbook]", err);
            throw err
        }
    }
}
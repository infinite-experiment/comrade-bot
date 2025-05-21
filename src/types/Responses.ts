export type HealthApiResponse = {
    status: string;
    up_since: string;
    uptime: string;
    services: {
        [key: string]: {
            status: string;
            details?: string;
        }
    }
}

export type InitRegistrationResponse = {
    ifc_id: string;
    is_verification_initiated: boolean;
    message?: string;
}
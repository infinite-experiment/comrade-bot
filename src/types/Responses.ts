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
    status: boolean;
    message?: string;
    steps: RegistrationStep[]
}

type RegistrationStep = {
    name: string;
    status: boolean;
    message: string;
}

export type ApiResponse<T> = {
    status: string;
    message: string;
    response_time: string;
    data?: T;
};
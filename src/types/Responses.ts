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

export interface InitServerResponse {
  va_code: string;
  status: boolean;
  message?: string;
  steps: RegistrationStep[];
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

export type FlightHistoryRecord = {
    origin: string;
    dest: string;
    timestamp: string;
    endtime: string;
    landings: number;
    server: string;
    equipment: string;
    mapUrl: string;
    callsign: string;
    violations: number;
    duration: string;      // HH:MM
    aircraft?: string;     // older API null-safety
    livery?: string;
  };
  
  export type FlightHistoryPage = {
    page: number;
    records: FlightHistoryRecord[];
    error: string;
  };
  
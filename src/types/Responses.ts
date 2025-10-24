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
  
export interface LiveFlightRecord {
  callsign: string;
  username: string;
  aircraft: string;
  livery: string;
  altitude: number;
  speed: number;
  origin: string;
  destination: string;
  lastReport: string;
}

export interface VARole {
  va_id: string;
  va_name: string;
  va_code: string;
  role: string;
  is_active: boolean;
  joined_at: string;
}

export interface CurrentVA {
  is_member: boolean;
  role: string;
  is_active: boolean;
}

export interface UserDetailsData {
  user_id: string;
  discord_id: string;
  if_community_id: string;
  if_api_id: string;
  is_active: boolean;
  created_at: string;
  affiliations: VARole[];
  current_va: CurrentVA;
}

export type UserDetailsResponse = ApiResponse<UserDetailsData>;

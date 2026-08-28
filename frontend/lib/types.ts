export interface Service {
    id: number;
    name: string;
    description: string | null;
}

export interface Member {
    name: string;
}

export interface VisitPayload {
    full_name: string;
    nik: string;
    phone: string;
    email: string;
    group_size: number;
    members: Member[];
    visit_date: string;
    service_id: number;
}

export interface VisitSuccessData {
    visitor_code: string;
    visit_number: string;
    qr_token: string;
}

export interface ApiValidationError {
    [key: string]: string[];
}

export class ApiError extends Error {
    public status: number;
    public errors?: ApiValidationError;

    constructor(message: string, status: number, errors?: ApiValidationError) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.name = 'ApiError';
    }
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
}

export interface OfficerUser {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
}

export interface LoginResponse<T> {
    token: string;
    user: T;
}

export interface DashboardStats {
    total_visits_today: number;
    active_visits: number;
    completed_today: number;
    total_visits_this_month: number;
}

export interface VisitScanData {
    id: number;
    visit_number: string;
    visit_date: string | null;
    status: string;
    checked_in_at: string | null;
    completed_at: string | null;
    service: {
        id: number;
        name: string;
    } | null;
    visitor: {
        visitor_code: string;
        name: string;
        nik?: string;
        phone?: string;
        email?: string;
    };
    members_count: number;
    group_size: number;
    members?: Member[];
}

export interface PaginatedVisitsResponse {
    data: VisitScanData[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        total_people: number;
    };
    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
}

export interface Service {
    id: number;
    name: string;
    is_active: boolean;
    sort_order: number;
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

export interface RecentVisitData {
    sequence_number: number;
    visit_number: string;
    visitor_name: string;
    visitor_email?: string | null;
    visitor_phone?: string | null;
    service_name: string;
    people_count: number;
    checked_in_at?: string | null;
    created_at?: string | null;
}

export interface DailyAnalytics {
    date: string;
    tickets: number;
    people: number;
}

export interface MonthlyAnalytics {
    month: string;
    tickets: number;
    people: number;
}

export interface AnalyticsData {
    daily_filter: string;
    monthly_filter: string;
    daily: DailyAnalytics[];
    monthly: MonthlyAnalytics[];
}

export interface DashboardStats {
    total_visits_today: number;
    total_people_today: number;
    active_visits: number;
    pending_people_today: number;
    completed_today: number;
    scanned_people_today: number;
    total_visits_this_month: number;
    recent_scanned: RecentVisitData[];
    recent_pending: RecentVisitData[];
    analytics?: AnalyticsData;
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
    summary?: {
        scanned: { tickets: number; people: number; };
        pending: { tickets: number; people: number; };
    };
}

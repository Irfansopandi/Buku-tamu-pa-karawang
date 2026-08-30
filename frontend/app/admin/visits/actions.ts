'use server'

import { fetchApiServer } from "../../../lib/server-api";
import { PaginatedVisitsResponse } from "../../../lib/types";

export interface AdminVisitsParams {
    page?: number;
    per_page?: number;
    search?: string;
    date?: string;
    month?: string;
    year?: string;
    status?: string;
    scanned_only?: boolean;
    pending_only?: boolean;
}

export async function getAdminVisits(params: AdminVisitsParams): Promise<PaginatedVisitsResponse | null> {
    try {
        const queryParams = new URLSearchParams();
        
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status && params.status !== 'all') queryParams.append('status', params.status);
        if (params.date) queryParams.append('date', params.date);
        if (params.month && params.year) {
            queryParams.append('month', params.month);
            queryParams.append('year', params.year);
        }
        if (params.scanned_only) queryParams.append('scanned_only', 'true');
        if (params.pending_only) queryParams.append('pending_only', 'true');

        const response = await fetchApiServer(`/api/admin/visits?${queryParams.toString()}`, "admin", { cache: "no-store" });
        return response || null;
    } catch (error) {
        console.error("Failed to fetch admin visits", error);
        return null;
    }
}



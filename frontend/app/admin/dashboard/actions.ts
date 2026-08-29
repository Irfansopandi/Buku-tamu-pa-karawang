'use server'

import { fetchApiServer } from "../../../lib/server-api";
import { DashboardStats } from "../../../lib/types";

export async function getDashboardStats(dailyFilter: string = '7d', monthlyFilter: string = '1y'): Promise<DashboardStats | null> {
    try {
        const response = await fetchApiServer(`/api/admin/dashboard?daily_filter=${dailyFilter}&monthly_filter=${monthlyFilter}`, "admin", { cache: "no-store" });
        return response?.data || null;
    } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        return null;
    }
}

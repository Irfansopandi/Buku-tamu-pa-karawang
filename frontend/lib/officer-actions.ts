"use server";

import { fetchApiServer } from "./server-api";
import { VisitScanData } from "./types";

export async function scanVisitAction(qrToken: string) {
    try {
        const response = await fetchApiServer("/api/officer/scan", "officer", {
            method: "POST",
            body: JSON.stringify({ qr_token: qrToken }),
        });
        return { success: true, data: response.data as VisitScanData };
    } catch (error: unknown) {
        let errorMessage = "Failed to scan QR code.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

export async function checkInVisitAction(visitId: number) {
    try {
        const response = await fetchApiServer(`/api/officer/visits/${visitId}/check-in`, "officer", {
            method: "POST",
        });
        return { success: true, data: response.data as VisitScanData };
    } catch (error: unknown) {
        let errorMessage = "Failed to check-in.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

export async function getTodayVisitsAction(page: number = 1) {
    try {
        const response = await fetchApiServer(`/api/officer/visits?page=${page}`, "officer", {
            method: "GET",
        });
        return { success: true, data: response as import('./types').PaginatedVisitsResponse };
    } catch (error: unknown) {
        let errorMessage = "Failed to fetch visits.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

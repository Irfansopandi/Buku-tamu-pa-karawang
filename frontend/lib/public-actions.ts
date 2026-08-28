"use server";

import { fetchApiServer } from "./server-api";
import { Service, VisitPayload, VisitSuccessData, ApiError } from "./types";

export async function fetchServicesAction() {
    try {
        const response = await fetchApiServer("/api/services", "public", {
            method: "GET",
        });
        return { success: true, data: response.data as Service[] };
    } catch (error: unknown) {
        let errorMessage = "Failed to fetch services.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage };
    }
}

export async function checkNikAction(nik: string) {
    try {
        const response = await fetchApiServer(`/api/visitors/check/${nik}`, "public", {
            method: "GET",
        });
        return { success: true, data: response.data };
    } catch (_error: unknown) {
        // If it's a 404, we don't treat it as a fatal error, just returning success: false
        return { success: false, error: "Visitor not found or network error." };
    }
}

export async function submitVisitAction(payload: VisitPayload) {
    try {
        const response = await fetchApiServer("/api/visits", "public", {
            method: "POST",
            body: JSON.stringify(payload),
        });
        return { success: true, data: response.data as VisitSuccessData };
    } catch (error: unknown) {
        if (error instanceof ApiError) {
            return { 
                success: false, 
                error: error.message, 
                validationErrors: error.errors,
                status: error.status
            };
        }
        return { success: false, error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi." };
    }
}

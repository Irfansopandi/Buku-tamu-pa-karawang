"use server";

import { fetchApiServer } from "./server-api";
import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export async function getAdminProfileAction() {
    try {
        const response = await fetchApiServer("/api/admin/profile", "admin", {
            method: "GET",
        });
        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to fetch profile." };
    }
}

export async function updateAdminProfileAction(data: { name: string; email: string }) {
    try {
        const response = await fetchApiServer("/api/admin/profile", "admin", {
            method: "PUT",
            body: JSON.stringify(data),
        });

        // Update cookie admin_name so header and dashboard reflect the new name
        const cookieStore = await cookies();
        cookieStore.set("admin_name", data.name, COOKIE_OPTIONS);

        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to update profile." };
    }
}

export async function updateAdminPasswordAction(data: any) {
    try {
        const response = await fetchApiServer("/api/admin/profile/password", "admin", {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return { success: true, data: response };
    } catch (error: any) {
        let errorMessage = error.message || "Failed to update password.";
        if (error.errors) {
            // Flatten validation errors
            errorMessage = Object.values(error.errors).flat().join(" ");
        }
        return { success: false, error: errorMessage };
    }
}

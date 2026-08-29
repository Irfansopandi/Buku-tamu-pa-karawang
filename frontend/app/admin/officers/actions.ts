"use server";

import { OfficerUser } from "@/lib/types";
import { fetchApiServer } from "../../../lib/server-api";

export async function getAdminOfficers(): Promise<OfficerUser[]> {
    try {
        const data = await fetchApiServer("/api/admin/officers", "admin", {
            cache: "no-store",
        });
        return data as OfficerUser[];
    } catch (error) {
        console.error("Error fetching officers:", error);
        return [];
    }
}

export async function createAdminOfficer(data: Partial<OfficerUser> & { password?: string }) {
    return await fetchApiServer("/api/admin/officers", "admin", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAdminOfficer(id: number, data: Partial<OfficerUser> & { password?: string }) {
    return await fetchApiServer(`/api/admin/officers/${id}`, "admin", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteAdminOfficer(id: number) {
    return await fetchApiServer(`/api/admin/officers/${id}`, "admin", {
        method: "DELETE",
    });
}

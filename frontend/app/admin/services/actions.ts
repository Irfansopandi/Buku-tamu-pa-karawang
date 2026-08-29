"use server";

import { Service } from "@/lib/types";
import { fetchApiServer } from "../../../lib/server-api";

export async function getAdminServices(): Promise<Service[]> {
    try {
        const data = await fetchApiServer("/api/admin/services", "admin", {
            cache: "no-store",
        });
        return data as Service[];
    } catch (error) {
        console.error("Error fetching services:", error);
        return [];
    }
}

export async function createAdminService(data: Partial<Service>) {
    return await fetchApiServer("/api/admin/services", "admin", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateAdminService(id: number, data: Partial<Service>) {
    return await fetchApiServer(`/api/admin/services/${id}`, "admin", {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteAdminService(id: number) {
    return await fetchApiServer(`/api/admin/services/${id}`, "admin", {
        method: "DELETE",
    });
}

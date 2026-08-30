"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}/api`;

export async function getSettingsAction() {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            cache: 'no-store'
        });
        const data = await response.json();
        if (response.ok && data.success) {
            return data.data;
        }
        return {};
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {};
    }
}

export async function updatePublicGuideAction(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    if (!token) return { success: false, message: "Unauthorized" };

    try {
        const response = await fetch(`${API_URL}/admin/settings/public-guide`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData, // fetch natively handles FormData (multipart/form-data)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            revalidatePath('/'); // Revalidate public page
            return { success: true, message: data.message };
        }

        return { 
            success: false, 
            message: data.message || "Gagal menyimpan pengaturan",
            errors: data.errors 
        };
    } catch (error) {
        console.error("Error updating public guide settings:", error);
        return { success: false, message: "Terjadi kesalahan sistem." };
    }
}

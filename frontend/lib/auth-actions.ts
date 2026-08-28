"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchApiServer } from "./server-api";
import { ApiError, LoginResponse, AdminUser, OfficerUser } from "./types";

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
};

export async function loginAdminAction(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email dan kata sandi wajib diisi." };
    }

    try {
        const response: LoginResponse<AdminUser> = await fetchApiServer("/api/login/admin", "public", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        const cookieStore = await cookies();
        cookieStore.set("admin_token", response.token, COOKIE_OPTIONS);
        cookieStore.set("admin_name", response.user.name, COOKIE_OPTIONS);
        
    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return { error: err.message };
        }
        return { error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi." };
    }

    redirect("/admin/dashboard?login=success");
}

export async function loginOfficerAction(prevState: unknown, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email dan kata sandi wajib diisi." };
    }

    try {
        const response: LoginResponse<OfficerUser> = await fetchApiServer("/api/login/officer", "public", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });

        const cookieStore = await cookies();
        cookieStore.set("officer_token", response.token, COOKIE_OPTIONS);
        cookieStore.set("officer_name", response.user.name, COOKIE_OPTIONS);

    } catch (err: unknown) {
        if (err instanceof ApiError) {
            return { error: err.message };
        }
        return { error: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi." };
    }

    redirect("/officer/dashboard?login=success");
}

export async function logoutAdminAction() {
    try {
        await fetchApiServer("/api/admin/logout", "admin", { method: "POST" });
    } catch {
        // Even if the token is already invalid (401), we proceed to clear it.
        // fetchApiServer already handles 401/403 eviction, but we do it explicitly below anyway.
    }

    const cookieStore = await cookies();
    cookieStore.delete("admin_token");
    
    redirect("/admin/login");
}

export async function logoutOfficerAction() {
    try {
        await fetchApiServer("/api/officer/logout", "officer", { method: "POST" });
    } catch {
        // Even if the token is already invalid (401), we proceed to clear it.
    }

    const cookieStore = await cookies();
    cookieStore.delete("officer_token");
    
    redirect("/officer/login");
}

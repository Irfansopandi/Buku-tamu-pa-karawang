import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

/**
 * Server-side API fetcher that automatically attaches the appropriate auth token
 * and handles 401/403 token evictions.
 */
export async function fetchApiServer(
    endpoint: string,
    role: "admin" | "officer" | "public",
    options: RequestInit = {}
) {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...((options.headers as Record<string, string>) || {}),
    };

    const cookieStore = await cookies();

    if (role !== "public") {
        const tokenCookieName = role === "admin" ? "admin_token" : "officer_token";
        const token = cookieStore.get(tokenCookieName)?.value;
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
    }

    const response = await fetch(url, {
        cache: "no-store",
        ...options,
        headers,
    });

    if (!response.ok) {
        let errorData = null;
        if (response.headers.get("content-type")?.includes("application/json")) {
            try {
                errorData = await response.json();
            } catch {
                // ignore
            }
        }

        // Handle Token Eviction for 401 / 403
        if ((response.status === 401 || response.status === 403) && role !== "public") {
            const tokenCookieName = role === "admin" ? "admin_token" : "officer_token";
            cookieStore.delete(tokenCookieName);
            
            // Redirect to appropriate login page, preserving standard NextJS redirect behavior
            // We append an error query param so the UI can know why it redirected, if needed.
            // But usually just throwing or redirecting is enough. 
            // The instructions said "redirect to correct login".
            const loginRoute = role === "admin" ? "/admin/login" : "/officer/login";
            // Next.js redirect() throws an error to halt execution and return a 307
            redirect(`${loginRoute}?error=${response.status}`);
        }

        const errorMessage = errorData?.message || response.statusText;
        throw new ApiError(errorMessage, response.status, errorData?.errors);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

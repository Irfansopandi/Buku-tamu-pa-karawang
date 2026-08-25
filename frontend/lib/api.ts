import { ApiError } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData = null;
    if (response.headers.get("content-type")?.includes("application/json")) {
        try {
            errorData = await response.json();
        } catch {
            // ignore JSON parse error on bad response
        }
    }
    
    if (errorData) {
        throw new ApiError(
            errorData.message || response.statusText,
            response.status,
            errorData.errors
        );
    }

    throw new ApiError(response.statusText, response.status);
  }

  // Handle 204 No Content
  if (response.status === 204) {
      return null;
  }

  return response.json();
};

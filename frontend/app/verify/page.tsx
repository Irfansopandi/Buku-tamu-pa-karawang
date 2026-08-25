"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "../../lib/api";

export default function VerifyPage() {
  const [status, setStatus] = useState("Checking connection...");
  const [httpStatus, setHttpStatus] = useState<string | null>(null);
  const [response, setResponse] = useState<unknown>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // We do a raw fetch to get the HTTP status because fetchApi directly returns response.json()
        // Wait, the instructions say: "Use the existing fetchApi helper. The request MUST go through: frontend/lib/api.ts"
        // And "Do NOT create another fetch wrapper."
        // Let's look at `frontend/lib/api.ts`. It throws an error if !response.ok with `response.statusText`, but it doesn't return the raw HTTP status code. It just returns `response.json()`.
        // So I'll use `fetchApi` and handle the response.

        // Wait, if I use fetchApi directly, I can't easily get the HTTP status if it's 200 OK because fetchApi returns the parsed JSON. 
        // I can just assume "200 OK" if it succeeds, and for errors parse the error message.
        
        // Actually, let's just do what we can with fetchApi.
        
        const data = await fetchApi('/api/services');
        
        setStatus("Connected");
        setHttpStatus("200 OK"); // fetchApi only returns if response.ok is true
        setResponse(data);

      } catch (error: unknown) {
        // fetchApi throws Error(`API error: ${response.statusText}`) or network error
        if (error instanceof Error) {
            if (error.message.includes('API error')) {
                setStatus("API Error");
                setHttpStatus(error.message.replace('API error: ', ''));
            } else {
                setStatus("Network Error");
                setHttpStatus("Unable to connect to Laravel API");
                setResponse({ error: error.message });
            }
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Connection Verification</h1>
      
      <div>
        <h2>Connection Status</h2>
        <p>{status}</p>
      </div>

      <div>
        <h2>HTTP Status</h2>
        <p>{httpStatus}</p>
      </div>

        <div>
        <h2>Raw API Response</h2>
        {response && (Array.isArray(response) ? response.length === 0 : (response as Record<string, unknown>).data && Array.isArray((response as Record<string, unknown>).data) && ((response as Record<string, unknown>).data as unknown[]).length === 0) ? (
            <p>API connected successfully, but no services were returned.</p>
        ) : (
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {response !== null ? JSON.stringify(response, null, 2) : "No response yet."}
            </pre>
        )}
      </div>
    </div>
  );
}

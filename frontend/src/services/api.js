export const TOKEN_KEY = "aldergate.token";

// Base URL of the Spring Boot backend. Set VITE_API_URL in frontend/.env to
// point local `npm run dev` at the deployed Railway backend, e.g.
//   VITE_API_URL=https://<RAILWAY-BACKEND-DOMAIN>
// When unset, requests stay relative ("/api/...") so the Vite dev proxy
// (vite.config.js) forwards them to a local backend at http://localhost:8080.
export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export function resolveUrl(path) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE_URL}${path}`;
}

export class ApiError extends Error {
  constructor(status, error, message, fields) {
    super(message);
    this.status = status;
    this.error = error;
    this.fields = fields;
  }
}

export async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(resolveUrl(path), config);
    
    // 204 No Content
    if (response.status === 204) {
      return null;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        // Dispatch custom event to let AuthContext know token expired
        window.dispatchEvent(new Event("auth:unauthorized"));
      }
      
      throw new ApiError(
        response.status,
        data?.error || "Request failed",
        data?.message || "An unexpected error occurred",
        data?.fields
      );
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, "Network Error", err.message || "Failed to connect to the server");
  }
}

export function getApiBaseUrl(): string {
  const explicit =
    typeof import.meta.env.VITE_API_URL === "string" ? import.meta.env.VITE_API_URL.trim() : "";

  // Dev + no URL: same-origin `/api` → Vite proxy (no CORS; works if Vite uses 5174, etc.).
  if (import.meta.env.DEV && !explicit) {
    return "/api";
  }

  const rawBase = (explicit || "http://localhost:5000").replace(/\/+$/, "");
  const apiPrefix = /\/api$/i.test(rawBase) ? "" : "/api";
  return `${rawBase}${apiPrefix}`;
}


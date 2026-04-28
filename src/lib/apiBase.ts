export function getApiBaseUrl(): string {
  const rawBase = (import.meta.env.VITE_API_URL ?? "http://localhost:5000").replace(/\/+$/, "");
  const apiPrefix = /\/api$/i.test(rawBase) ? "" : "/api";
  return `${rawBase}${apiPrefix}`;
}

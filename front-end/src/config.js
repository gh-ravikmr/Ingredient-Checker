// Single source of truth for the backend URL.
//
// Vite inlines `import.meta.env.*` at build time, so VITE_BACKEND_URL has to be
// present when `npm run build` runs — setting it only at runtime does nothing.
const configuredUrl =
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";

export const API_BASE_URL = (
  configuredUrl.trim() || "http://localhost:5000"
).replace(/\/+$/, "");

if (import.meta.env.PROD && !configuredUrl.trim()) {
  console.warn(
    "⚠️ VITE_BACKEND_URL was not set at build time — falling back to " +
      `${API_BASE_URL}, which will not work for deployed users.`
  );
}

export default API_BASE_URL;

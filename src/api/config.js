// ─── Carpeso Central API Configuration ───────────────────────────────────────
// Change BASE_URL here to update the ENTIRE application at once.
//
// Development (HTTP):  http://localhost:8080
// Production (HTTPS):  https://localhost:8443  ← uncomment before presentation
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_URL = 'http://localhost:8080';
// export const BASE_URL = 'https://localhost:8443';  // ← TLS version

export const API_URL  = `${BASE_URL}/api`;
export const IMG_BASE = `${BASE_URL}/api/files`;
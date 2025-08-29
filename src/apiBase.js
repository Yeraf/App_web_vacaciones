// src/apiBase.js

// Base inyectada por el build (workflow) o por .env.production
const RAW = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

// En dev, si no hay REACT_APP_API_BASE, usamos localhost.
// En prod, si falta (no debería), quedará vacío para que se note el error.
export const API_BASE =
  RAW || (process.env.NODE_ENV === "development" ? "http://localhost:3001" : "");

// === NUEVA: helper que SIEMPRE pega a /api ===
// Uso: apiFetch("/login", { method:"POST", body: JSON.stringify({...}) })
export function apiFetch(path, init = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}/api${p}`;
  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };
  return fetch(url, { ...init, headers });
}

// === COMPAT: helper antiguo 'api' ===
// - Si te pasan "/api/..." -> queda `${API_BASE}/api/...`
// - Si te pasan "http..."  -> se usa tal cual (no se toca)
// Esto evita romper componentes que aún usan { api }.
export function api(path, init) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  return fetch(url, init);
}

// También exportamos 'API' para compatibilidad con código viejo que lo usaba.
export const API = API_BASE;

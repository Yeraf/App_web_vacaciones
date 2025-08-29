// src/apiBase.js

// Base que se inyecta en build por el workflow (o por .env.production en raíz del proyecto)
const BUILD_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/+$/, "");

// En dev, si no hay REACT_APP_API_BASE, caemos a localhost.
// En prod, si no hay REACT_APP_API_BASE (no debería pasar), NO usamos localhost.
function resolveApiBase() {
  if (BUILD_BASE) return BUILD_BASE;
  if (process.env.NODE_ENV === "development") return "http://localhost:3001";
  return ""; // fuerza error visible si faltó configurar
}

export const API_BASE = resolveApiBase();

// Helper para pegarle SIEMPRE a /api del backend
export function apiFetch(path, init = {}) {
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE}/api${p}`;

  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
  };

  // Debug opcional: ver a dónde está llamando en consola
  // console.log("[apiFetch]", { url, API_BASE, NODE_ENV: process.env.NODE_ENV });

  return fetch(url, { ...init, headers });
}

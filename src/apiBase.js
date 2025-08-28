// src/apiBase.js
// Toma la base desde .env.* y quita una / final si viene
export const API = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");

/**
 * api(path, init)
 * - Si pasas un path relativo ("/api/..."), lo prefiere con la base.
 * - Si pasas una URL absoluta (http...), la usa tal cual (no rompe nada externo).
 * - Devuelve un fetch normal (Promise<Response>).
 */
export const api = (path, init) => {
  const url = path.startsWith("http")
    ? path
    : `${API}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, init);
};

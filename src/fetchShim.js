// src/fetchShim.js
const API_BASE = (process.env.REACT_APP_API_BASE || "").replace(/\/$/, "");
const LOCAL_BASE_RE = /^https?:\/\/localhost:3001/i;

export function installFetchBase() {
  if (typeof window === "undefined" || !window.fetch) return;

  const orig = window.fetch.bind(window);

  window.fetch = (input, init) => {
    let url = typeof input === "string" ? input : input?.url;
    if (!url) return orig(input, init);

    let finalUrl = url;

    // 1) Si usas rutas relativas tipo "/api/vales"
    if (finalUrl.startsWith("/api")) {
      if (API_BASE) finalUrl = API_BASE + finalUrl;
    }
    // 2) Si quedó hardcodeado "http://localhost:3001"
    else if (LOCAL_BASE_RE.test(finalUrl) && API_BASE) {
      finalUrl = finalUrl.replace(LOCAL_BASE_RE, API_BASE);
    }

    return orig(finalUrl, init);
  };
}

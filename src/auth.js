// src/auth.js
export function getUser() {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); }
  catch { return null; }
}

export function saveUser(user) {
  localStorage.setItem("usuario", JSON.stringify(user));
  if (user?.Localidad) localStorage.setItem("localidad", user.Localidad);
  else localStorage.removeItem("localidad");
  // 🔔 avisa al resto de la app que cambió la sesión
  window.dispatchEvent(new Event("auth-changed"));
}

export function clearUser() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("localidad");
  window.dispatchEvent(new Event("auth-changed"));
}

export function isLoggedIn() {
  return !!getUser();
}

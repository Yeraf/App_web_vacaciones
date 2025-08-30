// src/auth.js
export function readUser() {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); }
  catch { return null; }
}

export function saveUser(usuario) {
  localStorage.setItem("usuario", JSON.stringify(usuario));
  if (usuario?.Localidad) {
    localStorage.setItem("localidad", usuario.Localidad);
  } else {
    localStorage.removeItem("localidad");
  }
}

export function clearUser() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("localidad");
}

export function isLoggedIn() {
  return !!readUser();
}

// src/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { readUser } from "./auth";

export default function PrivateRoute({ children }) {
  // 🔑 Leemos el usuario SINCRÓNICAMENTE para evitar el “rebote”
  const [user] = useState(() => readUser());
  const [ready, setReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Si en el futuro quieres validar token en servidor, hazlo aquí y luego setReady(true)
    setReady(true);
  }, []);

  if (!ready) return null; // o un pequeño <div>Cargando...</div>

  return user ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
}

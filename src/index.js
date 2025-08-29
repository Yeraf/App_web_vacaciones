// src/index.js
import React from 'react';
import { createRoot } from "react-dom/client";
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { installFetchBase } from "./fetchShim";  // ← importa, pero NO lo ejecutes todavía

// ✅ Ejecuta funciones DESPUÉS de todos los imports
installFetchBase();

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

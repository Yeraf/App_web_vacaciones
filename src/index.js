import { installFetchBase } from "./fetchShim";
installFetchBase();
import React from 'react';
import { createRoot } from "react-dom/client";
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // 👈 importar

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);


// import React from 'react';
// import {createRoot} from "react-dom/client";
// import './index.css';
// import App from './App';

// const container = document.getElementById("root");
// const root = createRoot(container);

// root.render(
//   <App />
// );


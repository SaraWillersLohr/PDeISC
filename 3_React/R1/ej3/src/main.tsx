import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

// estilos generales
import "./styles/App.css";
import "./styles/light.css";
import "./styles/dark.css";

// punto de entrada de la aplicación
ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

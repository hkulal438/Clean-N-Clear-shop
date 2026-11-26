import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { CartProvider } from "./context/CartContext";
import "./styles/styles.css";
import "./styles/consult-track.css";
import "./styles/footer.css";
import "./styles/why.css";
import "./styles/hero-slider.css";
import "./styles/cnc.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);

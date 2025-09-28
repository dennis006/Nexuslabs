import "@/styles/globals.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TranslationProvider } from "@/lib/i18n/TranslationProvider";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root container not found");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </BrowserRouter>
  </StrictMode>
);

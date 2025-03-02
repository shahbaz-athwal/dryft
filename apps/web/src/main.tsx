import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@repo/ui/globals.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./pages/auth/page.tsx";
import Dashboard from "./pages/dashboard/page.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

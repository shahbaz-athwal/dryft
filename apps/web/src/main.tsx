import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@repo/ui/globals.css";
import App from "./App.tsx";
import { BrowserRouter, Routes, Route } from "react-router";
import Auth from "./pages/auth/page.tsx";
import Dashboard from "./pages/dashboard/page.tsx";
import { Toaster } from "~/components/sonner.tsx";
import { ThemeProvider } from "~/components/theme-provider";
import { Navbar } from "~/components/Navbar";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mx-auto mt-4">
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);

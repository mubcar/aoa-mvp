import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Admin } from "./pages/Admin";
import { ResetPassword } from "./pages/ResetPassword";

function CalendlyRedirect() {
  useEffect(() => {
    window.location.href = "https://calendly.com/mubcarvalho/30min";
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<CalendlyRedirect />} />
        <Route path="/onboarding" element={<CalendlyRedirect />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

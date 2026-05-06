import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Landing } from "./pages/Landing";

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

import { useState, useEffect } from "react";
import { Calendar, Sparkles } from "lucide-react";
import { BookCallModal } from "./BookCallModal";

/**
 * Full-screen gate that blocks the dashboard until the user books
 * a setup call.
 *
 * Bypassed when:
 *  - hasBusiness is true (admin already linked their account)
 *  - localStorage.aoa_setup_booked === 'true' (they already booked)
 */
export function SetupGate({ hasBusiness = false }) {
  const [booked, setBooked] = useState(() => {
    if (typeof window === "undefined") return true;
    if (hasBusiness) return true;
    return localStorage.getItem("aoa_setup_booked") === "true";
  });

  // If admin links the business while the page is open, bypass the gate
  useEffect(() => {
    if (hasBusiness) setBooked(true);
  }, [hasBusiness]);
  const [modalOpen, setModalOpen] = useState(false);

  // React to localStorage changes in other tabs
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "aoa_setup_booked") setBooked(e.newValue === "true");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (booked && !modalOpen) return null;

  return (
    <>
      {/* Blurred blocking overlay */}
      {!booked && !modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6 backdrop-blur-md bg-white/60">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bem-vindo ao AOA
            </h2>
            <p className="text-gray-600 mb-6">
              Antes de começar, precisamos configurar sua IA com você.
              Agende uma chamada rápida de 30 minutos e deixamos tudo pronto.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Agendar Chamada de Setup
            </button>
            <p className="text-xs text-gray-400 mt-4">
              Obrigatório para ativar seu dashboard
            </p>
          </div>
        </div>
      )}

      {modalOpen && (
        <BookCallModal
          onClose={booked ? () => setModalOpen(false) : undefined}
          onSuccess={() => setBooked(true)}
        />
      )}
    </>
  );
}

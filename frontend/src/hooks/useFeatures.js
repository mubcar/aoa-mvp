import { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let cache = null;
let inflight = null;

export function useFeatures() {
  const [features, setFeatures] = useState(cache || { solanaEscrow: false, paymentMode: "none" });
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    if (!inflight) {
      inflight = fetch(`${API_URL}/api/config/features`)
        .then((r) => r.json())
        .catch(() => ({ solanaEscrow: false, paymentMode: "none" }));
    }
    inflight.then((data) => {
      cache = data;
      setFeatures(data);
      setLoading(false);
    });
  }, []);

  return { features, loading };
}

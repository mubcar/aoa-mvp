import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    async function fetchLeads() {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setLeads(data || []);
      setLoading(false);
    }

    fetchLeads();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leads" },
        (payload) => {
          setLeads((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leads" },
        (payload) => {
          setLeads((prev) =>
            prev.map((lead) =>
              lead.id === payload.new.id ? payload.new : lead
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { leads, loading };
}

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useRealtimeLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    async function init() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get user's business
      const { data: biz } = await supabase
        .from("businesses")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      if (!biz) { setLoading(false); return; }
      setBusiness(biz);

      // Fetch leads for this business (RLS also enforces this)
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("business_id", biz.id)
        .order("created_at", { ascending: false })
        .limit(50);
      setLeads(data || []);
      setLoading(false);

      // Subscribe to real-time changes for this business's leads
      const channel = supabase
        .channel("leads-realtime")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "leads", filter: `business_id=eq.${biz.id}` },
          (payload) => {
            setLeads((prev) => [payload.new, ...prev]);
          }
        )
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "leads", filter: `business_id=eq.${biz.id}` },
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
    }

    init();
  }, []);

  return { leads, loading, business };
}

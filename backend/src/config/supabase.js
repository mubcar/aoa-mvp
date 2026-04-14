import { createClient } from "@supabase/supabase-js";

let _supabase = null;
let _initialized = false;

export function getSupabase() {
  if (!_initialized) {
    _initialized = true;
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && key) {
      _supabase = createClient(url, key);
    } else {
      console.warn("⚠️  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — Supabase features disabled.");
    }
  }
  return _supabase;
}

// For backwards compatibility — lazy getter
export const supabase = new Proxy({}, {
  get(_, prop) {
    const client = getSupabase();
    if (!client) throw new Error("Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    return typeof client[prop] === "function" ? client[prop].bind(client) : client[prop];
  }
});

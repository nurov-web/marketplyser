import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Publishable keys — safe in client; env overrides for other projects. */
const DEFAULT_SUPABASE_URL = "https://jnsndodhnlxmiynuwvwv.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_jB9eNZQWvEsLNBiV8gf37g_J3Uj3k3z";

let client: SupabaseClient | null = null;

function supabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || DEFAULT_SUPABASE_URL;
  return url.includes("YOUR_PROJECT") ? DEFAULT_SUPABASE_URL : url;
}

function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || DEFAULT_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  const url = supabaseUrl();
  const anonKey = supabaseAnonKey();
  return Boolean(url && anonKey);
}

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!isSupabaseConfigured()) {
    throw new Error("Пайваст ба Google ҳанӯз омода нест.");
  }
  client = createClient(supabaseUrl(), supabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return client;
}

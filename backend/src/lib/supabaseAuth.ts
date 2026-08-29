import { createClient, type User } from "@supabase/supabase-js";
import { config } from "../config";

function client() {
  const url = config.supabaseUrl;
  const anonKey = config.supabaseAnonKey;
  if (!url || !anonKey) {
    throw Object.assign(new Error("Supabase танзим нашудааст"), { status: 503 });
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type SupabaseAuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
};

function splitName(user: User): { firstName: string; lastName: string } {
  const meta = user.user_metadata || {};
  const full = String(meta.full_name || meta.name || "").trim();
  if (full) {
    const parts = full.split(/\s+/);
    return {
      firstName: parts[0] || "User",
      lastName: parts.slice(1).join(" ") || "Google",
    };
  }
  const given = String(meta.given_name || meta.first_name || "").trim();
  const family = String(meta.family_name || meta.last_name || "").trim();
  if (given || family) {
    return { firstName: given || "User", lastName: family || "Google" };
  }
  const local = (user.email || "user").split("@")[0];
  return { firstName: local.slice(0, 40) || "User", lastName: "Google" };
}

/** Санҷиши access token (OTP / Google) — email тасдиқшуда. */
export async function assertSupabaseEmailConfirmed(accessToken: string): Promise<SupabaseAuthUser> {
  const supabase = client();
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) {
    throw Object.assign(new Error("Тасдиқи email лозим аст"), { status: 401 });
  }

  const confirmed = Boolean(data.user.email_confirmed_at || data.user.confirmed_at);
  if (!confirmed) {
    throw Object.assign(new Error("Аввал email-ро тасдиқ кунед"), { status: 403 });
  }

  const email = (data.user.email || "").toLowerCase();
  if (!email) {
    throw Object.assign(new Error("Email дар сессия нест"), { status: 400 });
  }

  const { firstName, lastName } = splitName(data.user);
  const avatar = String(data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || "") || undefined;

  return { id: data.user.id, email, firstName, lastName, avatar };
}

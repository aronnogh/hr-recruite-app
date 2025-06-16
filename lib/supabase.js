// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Service Role Key");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Important: a service role key should only be used on the server
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
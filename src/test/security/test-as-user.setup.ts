import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/**
 * Autentica como um usuario de teste NAO-admin usando a mesma publishable key
 * do client de producao (nunca service_role) - ver docs/testing/test-as-user-guide.md.
 */
export async function createAuthenticatedTestUserClient() {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL/TEST_USER_PASSWORD nao configuradas. Ver docs/testing/test-as-user-guide.md.",
    );
  }

  const client = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;

  return { client, user: data.user };
}

export const hasTestUserCredentials = Boolean(
  process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD,
);

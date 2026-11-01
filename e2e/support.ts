import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/** E2E runs against the real Supabase project in .env.local. */
export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-project"),
);

export function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** A confirmed email/password user, so tests skip the inbox step. */
export async function createConfirmedUser() {
  const email = `e2e+${randomUUID().slice(0, 8)}@tenma.test`;
  const password = `Pw-${randomUUID()}`;
  const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  return { id: data.user.id, email, password };
}

export async function deleteUser(id: string) {
  await admin().auth.admin.deleteUser(id);
}

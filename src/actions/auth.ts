"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { fieldErrors } from "@/domain/player/player.schema";
import { publicEnv } from "@/lib/env";
import type { ActionResult, UserError } from "@/lib/errors";
import { safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.email({ message: "Masukkan email yang valid." }),
  password: z.string().min(8, "Password minimal 8 karakter."),
});

const authError = (code: string, title: string, description: string): UserError => ({ code, title, description });

function mapAuthError(error: { code?: string; message: string }): UserError {
  switch (error.code) {
    case "invalid_credentials":
      return authError(error.code, "Email atau password salah.", "Cek lagi, atau daftar kalau belum punya akun.");
    case "email_not_confirmed":
      return authError(error.code, "Email belum dikonfirmasi.", "Buka link konfirmasi di inbox kamu, lalu login lagi.");
    case "user_already_exists":
    case "email_exists":
      return authError(error.code, "Email sudah terdaftar.", "Langsung login aja pakai email ini.");
    case "weak_password":
      return authError(error.code, "Password terlalu lemah.", "Gunakan minimal 8 karakter, campur huruf dan angka.");
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return authError(error.code, "Terlalu banyak percobaan.", "Tunggu beberapa menit lalu coba lagi.");
    default:
      console.error("[auth]", error);
      return authError("UNKNOWN", "Gagal masuk.", "Coba lagi sebentar lagi.");
  }
}

const invalid = (error: z.ZodError): ActionResult<never> => ({
  ok: false,
  error: authError("VALIDATION", "Ada isian yang belum pas.", "Cek lagi bagian yang ditandai merah."),
  fieldErrors: fieldErrors(error),
});

export async function signIn(_prev: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: mapAuthError(error) };

  redirect(safeNextPath(formData.get("next")?.toString()));
}

export async function signUp(_prev: unknown, formData: FormData): Promise<ActionResult<{ email: string }>> {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return invalid(parsed.error);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${publicEnv.siteUrl}/auth/callback?next=/onboarding` },
  });
  if (error) return { ok: false, error: mapAuthError(error) };
  // Supabase hides existing accounts behind a fake success with no identities.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, error: mapAuthError({ code: "user_already_exists", message: "" }) };
  }
  if (data.session) redirect("/onboarding");
  return { ok: true, data: { email: parsed.data.email } };
}

export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNextPath(formData.get("next")?.toString());
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${publicEnv.siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) {
    console.error("[auth:google]", error);
    redirect("/login?error=oauth");
  }
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

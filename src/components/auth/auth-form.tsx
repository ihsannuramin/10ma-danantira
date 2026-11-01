"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, signInWithGoogle, signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Alert, EmptyState } from "@/components/ui/state";
import { useFormAction } from "@/components/ui/use-form-action";
import { IDLE, type ActionState } from "@/lib/errors";

const CALLBACK_ERRORS: Record<string, { title: string; description: string }> = {
  callback: { title: "Link login sudah tidak berlaku.", description: "Coba login lagi atau minta link konfirmasi baru." },
  oauth: { title: "Login Google gagal.", description: "Coba lagi, atau pakai email dan password." },
};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const callbackError = CALLBACK_ERRORS[params.get("error") ?? ""];

  const [state, onSubmit, pending] = useFormAction<ActionState<{ email: string } | void>>(
    mode === "login" ? signIn : signUp,
    IDLE,
  );

  if (state.ok === true && state.data) {
    return (
      <EmptyState
        icon={<MailCheck aria-hidden />}
        title="Cek email kamu"
        description={`Kami kirim link konfirmasi ke ${state.data.email}. Buka link itu untuk mulai.`}
      />
    );
  }

  const errors = state.ok === false ? (state.fieldErrors ?? {}) : {};
  const formError = state.ok === false && !state.fieldErrors ? state.error : null;

  return (
    <div className="flex flex-col gap-5">
      {(formError ?? callbackError) && <Alert {...(formError ?? callbackError)!} />}

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" fullWidth icon={<GoogleIcon />}>
          Lanjut dengan Google
        </Button>
      </form>

      <div className="flex items-center gap-3 text-caption text-muted" aria-hidden>
        <span className="h-px flex-1 bg-line" />
        atau pakai email
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <input type="hidden" name="next" value={next} />
        <Field id="email" label="Email" error={errors.email}>
          <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required error={errors.email} />
        </Field>
        <Field
          id="password"
          label="Password"
          error={errors.password}
          hint={mode === "register" ? "Minimal 8 karakter." : undefined}
        >
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={8}
            error={errors.password}
            hint={mode === "register" ? "Minimal 8 karakter." : undefined}
          />
        </Field>
        <Button type="submit" fullWidth loading={pending} className="mt-2">
          {mode === "login" ? "Login" : "Daftar"}
        </Button>
      </form>

      <p className="text-center text-body-sm text-muted">
        {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
        <Link
          href={`/${mode === "login" ? "register" : "login"}${next ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-bold text-ink underline underline-offset-4"
        >
          {mode === "login" ? "Daftar" : "Login"}
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2-1.9 3.3-4.7 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.5H2.2v2.8A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.9 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.7-2.8z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.7 2.8C6.8 7.3 9.2 5.4 12 5.4z" />
    </svg>
  );
}

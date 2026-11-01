import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/card";
import { AuthForm } from "./auth-form";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  return (
    <main className="flex min-h-dvh flex-col items-center bg-soft px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <Link href="/" className="self-start">
          <Logo />
        </Link>
        <div>
          <h1 className="text-h1">{mode === "login" ? "Selamat datang lagi" : "Bikin akun dulu"}</h1>
          <p className="mt-1 text-body text-muted">
            {mode === "login" ? "Login untuk lanjut cari mabar." : "Gratis. Habis ini kita tentukan level kamu."}
          </p>
        </div>
        <div className="rounded-lg border border-line bg-white p-5">
          {/* AuthForm reads the query string (?next, ?error), which is request data. */}
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <AuthForm mode={mode} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

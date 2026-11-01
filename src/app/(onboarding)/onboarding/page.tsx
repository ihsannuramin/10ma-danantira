import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { OnboardingForm } from "@/components/player/onboarding-form";
import { Skeleton } from "@/components/ui/card";
import { getCurrentPlayer } from "@/data/auth";
import { getAreas } from "@/data/reference";
import { safeNextPath } from "@/lib/routes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Buat Profil" };

export default function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-6 px-4 pt-8">
      <Logo />
      <Suspense fallback={<OnboardingSkeleton />}>
        <Onboarding searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Onboarding({ searchParams }: { searchParams: PageProps<"/onboarding">["searchParams"] }) {
  const { next } = await searchParams;
  // Only same-site paths; anything else falls back to the default CTAs.
  const returnTo = typeof next === "string" && safeNextPath(next) === next ? next : null;
  if (await getCurrentPlayer()) redirect(returnTo ?? "/home");

  const supabase = await createClient();
  const [areas, { data }] = await Promise.all([getAreas(), supabase.auth.getClaims()]);
  const meta = data?.claims?.user_metadata;
  const defaultName = typeof meta?.full_name === "string" ? meta.full_name.split(" ")[0]! : "";

  return <OnboardingForm areas={areas} defaultName={defaultName} returnTo={returnTo} />;
}

function OnboardingSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-1.5 w-full" />
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

import { ArrowRight, Bell, ChevronRight, Plus, Search, Trophy, UserRoundSearch, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MabarCard, MabarCardSkeleton } from "@/components/mabar/mabar-card";
import { RatingCard } from "@/components/rating/rating-card";
import { Avatar } from "@/components/ui/avatar";
import { buttonClasses } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { Page } from "@/components/layout/top-bar";
import { requirePlayer } from "@/data/auth";
import { getMyMabars } from "@/data/mabar";

export const metadata: Metadata = { title: "Home" };

const QUICK_ACTIONS = [
  { href: "/mabar/new", label: "Create Mabar", icon: Plus },
  { href: null, label: "Find Player", icon: UserRoundSearch },
  { href: null, label: "Leaderboard", icon: Trophy },
  { href: "/community", label: "Community", icon: Users },
] as const;

// Order fixed by Design.md §14: greeting, Find CTA, quick actions,
// upcoming matches, rating. Recommended mabar arrives with matchmaking (P1).
export default function HomePage() {
  return (
    <Page>
      <div className="flex flex-col gap-6 pt-4">
        <Suspense fallback={<GreetingSkeleton />}>
          <Greeting />
        </Suspense>

        <Link href="/mabar" className="block rounded-lg focus-visible:outline-offset-4">
          <span className="flex items-center gap-4 rounded-lg border-2 border-ink bg-lime p-5 shadow-brutal transition-transform active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <span className="flex-1">
              <span className="block text-h2">Find Your Next Match</span>
              <span className="block text-body-sm">Cari mabar yang cocok buat kamu.</span>
            </span>
            <span className="flex size-11 items-center justify-center rounded-full bg-ink text-lime">
              <ArrowRight className="size-5" aria-hidden />
            </span>
          </span>
        </Link>

        <nav aria-label="Aksi cepat">
          <ul className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => {
              const body = (
                <>
                  <span className="flex size-11 items-center justify-center rounded-md border border-line bg-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-center text-caption leading-tight">{label}</span>
                  {!href && <span className="text-[0.625rem] font-semibold uppercase text-muted">Segera</span>}
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <Link href={href} className="flex flex-col items-center gap-1.5 rounded-md py-1 font-semibold">
                      {body}
                    </Link>
                  ) : (
                    <span className="flex flex-col items-center gap-1.5 py-1 font-semibold opacity-60" aria-disabled>
                      {body}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <section className="flex flex-col gap-3" aria-labelledby="upcoming-heading">
          <div className="flex items-center justify-between">
            <h2 id="upcoming-heading" className="text-h3">
              Upcoming Matches
            </h2>
            <Link href="/matches" className="flex min-h-11 items-center gap-0.5 text-body-sm font-semibold text-muted hover:text-ink">
              Lihat semua <ChevronRight className="size-4" aria-hidden />
            </Link>
          </div>
          <Suspense fallback={<MabarCardSkeleton />}>
            <UpcomingMatches />
          </Suspense>
        </section>

        <Suspense fallback={<Skeleton className="h-20 w-full rounded-lg" />}>
          <HomeRating />
        </Suspense>
      </div>
    </Page>
  );
}

async function Greeting() {
  const player = await requirePlayer();
  return (
    <header className="flex items-center gap-3">
      <div className="flex-1">
        <h1 className="text-h1">Halo, {player.displayName}! 👋</h1>
        <p className="text-body text-muted">Siap main tenis hari ini?</p>
      </div>
      <span className="inline-flex size-11 items-center justify-center rounded-full text-muted" title="Notifikasi segera hadir">
        <Bell className="size-6" aria-hidden />
        <span className="sr-only">Notifikasi (segera hadir)</span>
      </span>
      <Link href="/profile" aria-label="Profil kamu">
        <Avatar name={player.displayName} src={player.photoUrl} />
      </Link>
    </header>
  );
}

async function UpcomingMatches() {
  const [player, upcoming] = await Promise.all([requirePlayer(), getMyMabars("upcoming")]);
  if (upcoming.length === 0) {
    return (
      <EmptyState
        icon={<Search aria-hidden />}
        title="Belum ada match."
        description="Cari mabar yang sesuai dengan level dan jadwal kamu."
        action={
          <Link href="/mabar" className={buttonClasses()}>
            Find Mabar
          </Link>
        }
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {upcoming.slice(0, 2).map((m) => (
        <MabarCard key={m.id} mabar={m} viewerRating={player.rating} joined />
      ))}
    </div>
  );
}

async function HomeRating() {
  const player = await requirePlayer();
  return (
    <Link href="/stats" className="block rounded-lg">
      <RatingCard player={player} compact />
    </Link>
  );
}

function GreetingSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-40" />
      </div>
      <Skeleton className="size-11 rounded-full" />
    </div>
  );
}

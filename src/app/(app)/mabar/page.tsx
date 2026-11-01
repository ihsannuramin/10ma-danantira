import { Plus, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FilterBar } from "@/components/mabar/filter-bar";
import { MabarCard, MabarCardSkeleton } from "@/components/mabar/mabar-card";
import { Page, TopBar } from "@/components/layout/top-bar";
import { buttonClasses } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { requirePlayer } from "@/data/auth";
import { getMyMabars, parseMabarFilters, searchMabars } from "@/data/mabar";
import { getAreas } from "@/data/reference";

export const metadata: Metadata = { title: "Find Mabar" };

export default function FindMabarPage({ searchParams }: PageProps<"/mabar">) {
  return (
    <Page wide>
      <TopBar
        title="Find Mabar"
        backHref="/home"
        actions={
          <Link href="/mabar/new" className={buttonClasses({ size: "sm", className: "mr-2 lg:mr-0" })}>
            <Plus className="size-4" aria-hidden />
            Buat
          </Link>
        }
      />
      <div className="flex flex-col gap-5">
        <Suspense fallback={<Skeleton className="h-28 w-full" />}>
          <Filters />
        </Suspense>
        <Suspense fallback={<ResultsSkeleton />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </div>
    </Page>
  );
}

async function Filters() {
  const areas = await getAreas();
  return <FilterBar areas={areas} />;
}

async function Results({ searchParams }: { searchParams: PageProps<"/mabar">["searchParams"] }) {
  const params = await searchParams;
  const filters = parseMabarFilters(params);
  const [player, { items, nextCursor }, mine] = await Promise.all([
    requirePlayer(),
    searchMabars(filters),
    getMyMabars("upcoming"),
  ]);
  // Search rows don't know who joined; mark the player's own sessions.
  const joinedIds = new Set(mine.map((m) => m.id));

  if (items.length === 0) {
    const filtered = Object.entries(filters).some(([k, v]) => k !== "cursor" && v);
    return (
      <EmptyState
        icon={<SearchX aria-hidden />}
        title={filtered ? "Belum ada mabar yang cocok." : "Belum ada mabar."}
        description={
          filtered ? "Coba perluas lokasi atau level pencarian, atau buat mabar sendiri." : "Jadi yang pertama! Buat mabar dan ajak teman main."
        }
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            {filtered && (
              <Link href="/mabar" className={buttonClasses({ variant: "secondary" })}>
                Adjust Filters
              </Link>
            )}
            <Link href="/mabar/new" className={buttonClasses()}>
              Create Mabar
            </Link>
          </div>
        }
      />
    );
  }

  // Same filters, different page.
  const pageHref = (cursor: string | null) => {
    const next = new URLSearchParams(
      Object.entries(params).flatMap(([k, v]) => (typeof v === "string" && k !== "cursor" ? [[k, v]] : [])),
    );
    if (cursor) next.set("cursor", cursor);
    return `/mabar?${next.toString()}`;
  };

  return (
    <section aria-label="Hasil pencarian" className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((m) => (
          <MabarCard key={m.id} mabar={m} viewerRating={player.rating} joined={joinedIds.has(m.id)} />
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {filters.cursor && (
          <Link href={pageHref(null)} className={buttonClasses({ variant: "ghost" })}>
            Ke awal
          </Link>
        )}
        {nextCursor && (
          <Link href={pageHref(nextCursor)} className={buttonClasses({ variant: "secondary" })}>
            Mabar berikutnya
          </Link>
        )}
      </div>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <MabarCardSkeleton />
      <MabarCardSkeleton />
      <MabarCardSkeleton />
    </div>
  );
}

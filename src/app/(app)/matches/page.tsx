import { CalendarDays, Plus, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MabarCard, MabarCardSkeleton } from "@/components/mabar/mabar-card";
import { Page, TopBar } from "@/components/layout/top-bar";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { requirePlayer } from "@/data/auth";
import { getMyMabars } from "@/data/mabar";
import { HISTORY_FILTERS, getMatchHistory, type HistoryFilter } from "@/data/match";
import { HistoryItem } from "@/components/match/history-item";
import { Skeleton } from "@/components/ui/card";
import { cn } from "@/lib/cn";

const FILTER_LABEL: Record<HistoryFilter, string> = {
  ALL: "Semua",
  WINS: "Wins",
  LOSSES: "Losses",
  CASUAL: "Casual",
  COMPETITIVE: "Competitive",
  SINGLES: "Singles",
  DOUBLES: "Doubles",
};

export const metadata: Metadata = { title: "Matches" };

export default function MatchesPage({ searchParams }: PageProps<"/matches">) {
  return (
    <Page wide>
      <TopBar
        title="Matches"
        actions={
          <div className="mr-2 flex gap-2 lg:mr-0">
            <Link href="/mabar" className={buttonClasses({ variant: "secondary", size: "sm" })}>
              <Search className="size-4" aria-hidden />
              Cari
            </Link>
            <Link href="/mabar/new" className={buttonClasses({ size: "sm" })}>
              <Plus className="size-4" aria-hidden />
              Buat
            </Link>
          </div>
        }
      />
      <div className="flex flex-col gap-8">
        <section aria-labelledby="upcoming" className="flex flex-col gap-3">
          <h2 id="upcoming" className="text-h3">
            Upcoming
          </h2>
          <Suspense fallback={<ListSkeleton />}>
            <MabarList scope="upcoming" />
          </Suspense>
        </section>
        <section id="history" aria-labelledby="history-heading" className="flex scroll-mt-20 flex-col gap-3">
          <h2 id="history-heading" className="text-h3">
            Riwayat Match
          </h2>
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <MatchHistory searchParams={searchParams} />
          </Suspense>
        </section>
        <section aria-labelledby="past" className="flex flex-col gap-3">
          <h2 id="past" className="text-h3">
            Mabar Selesai
          </h2>
          <Suspense fallback={<ListSkeleton />}>
            <MabarList scope="past" />
          </Suspense>
        </section>
      </div>
    </Page>
  );
}

async function MatchHistory({ searchParams }: { searchParams: PageProps<"/matches">["searchParams"] }) {
  const params = await searchParams;
  const filter = HISTORY_FILTERS.includes(params.h as HistoryFilter) ? (params.h as HistoryFilter) : "ALL";
  const before = typeof params.before === "string" ? params.before : undefined;
  const player = await requirePlayer();
  const { items, nextCursor } = await getMatchHistory(player.id, filter, before);
  const href = (h: HistoryFilter, cursor?: string) => {
    const q = new URLSearchParams();
    if (h !== "ALL") q.set("h", h);
    if (cursor) q.set("before", cursor);
    const qs = q.toString();
    return `/matches${qs ? `?${qs}` : ""}#history`;
  };

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Filter riwayat" className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {HISTORY_FILTERS.map((f) => (
          <Link
            key={f}
            href={href(f)}
            scroll={false}
            aria-current={f === filter ? "page" : undefined}
            className={cn(
              "inline-flex h-11 shrink-0 items-center rounded-full border px-4 text-body-sm font-semibold",
              f === filter ? "border-ink bg-lime" : "border-line bg-white hover:border-ink/40",
            )}
          >
            {FILTER_LABEL[f]}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <EmptyState
          icon={<CalendarDays aria-hidden />}
          title={filter === "ALL" && !before ? "Belum ada match selesai." : "Tidak ada match untuk filter ini."}
          description="Hasil match yang sudah official akan muncul di sini, lengkap dengan perubahan rating."
        />
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-white">
          {items.map((e) => (
            <HistoryItem key={e.matchId} entry={e} />
          ))}
        </ul>
      )}
      <div className="flex justify-center gap-3">
        {before && (
          <Link href={href(filter)} className={buttonClasses({ variant: "ghost" })}>
            Terbaru
          </Link>
        )}
        {nextCursor && (
          <Link href={href(filter, nextCursor)} className={buttonClasses({ variant: "secondary" })}>
            Match sebelumnya
          </Link>
        )}
      </div>
    </div>
  );
}

async function MabarList({ scope }: { scope: "upcoming" | "past" }) {
  const [player, items] = await Promise.all([requirePlayer(), getMyMabars(scope)]);
  if (items.length === 0) {
    return scope === "upcoming" ? (
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
    ) : (
      <EmptyState
        icon={<CalendarDays aria-hidden />}
        title="Riwayat masih kosong."
        description="Mabar yang sudah lewat atau dibatalkan akan muncul di sini."
      />
    );
  }
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((m) => (
        <MabarCard key={m.id} mabar={m} viewerRating={player.rating} joined />
      ))}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <MabarCardSkeleton />
      <MabarCardSkeleton />
    </div>
  );
}

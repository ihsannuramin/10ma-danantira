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

export const metadata: Metadata = { title: "Matches" };

export default function MatchesPage() {
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
        <section aria-labelledby="past" className="flex flex-col gap-3">
          <h2 id="past" className="text-h3">
            Riwayat
          </h2>
          <Suspense fallback={<ListSkeleton />}>
            <MabarList scope="past" />
          </Suspense>
        </section>
      </div>
    </Page>
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

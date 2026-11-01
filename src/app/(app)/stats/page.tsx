import { ChartColumn } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RatingCard } from "@/components/rating/rating-card";
import { Page, TopBar } from "@/components/layout/top-bar";
import { buttonClasses } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { requirePlayer } from "@/data/auth";

export const metadata: Metadata = { title: "My Tennis" };

// Progress chart, history and recent form arrive with match results
// (iteration 2). Until then this shows the rating and what unlocks the rest.
export default function StatsPage() {
  return (
    <Page>
      <TopBar title="My Tennis" />
      <div className="flex flex-col gap-5">
        <Suspense fallback={<Skeleton className="h-56 w-full rounded-lg" />}>
          <StatsRating />
        </Suspense>
        <EmptyState
          icon={<ChartColumn aria-hidden />}
          title="Grafik progress muncul setelah match pertama."
          description="Main match Competitive dan konfirmasi hasilnya untuk melihat rating kamu bergerak."
          action={
            <Link href="/mabar?type=COMPETITIVE" className={buttonClasses()}>
              Cari Mabar Competitive
            </Link>
          }
        />
      </div>
    </Page>
  );
}

async function StatsRating() {
  const player = await requirePlayer();
  return <RatingCard player={player} />;
}

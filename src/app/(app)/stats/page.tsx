import { ChartColumn } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { RatingCard } from "@/components/rating/rating-card";
import { RatingChart } from "@/components/stats/rating-chart";
import { RecentForm } from "@/components/stats/recent-form";
import { Page, TopBar } from "@/components/layout/top-bar";
import { buttonClasses } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { requirePlayer } from "@/data/auth";
import { getPlayerStats } from "@/data/match";

export const metadata: Metadata = { title: "My Tennis" };

export default function StatsPage() {
  return (
    <Page>
      <TopBar title="My Tennis" />
      <Suspense fallback={<StatsSkeleton />}>
        <Stats />
      </Suspense>
    </Page>
  );
}

async function Stats() {
  const player = await requirePlayer();
  const stats = await getPlayerStats(player.id);

  return (
    <div className="flex flex-col gap-5">
      <RatingCard player={player} stats={stats} />

      {stats.matches > 0 && (
        <Card className="grid grid-cols-2 gap-4 p-5">
          <div>
            <p className="text-caption text-muted">Win Rate</p>
            <p className="text-h1">{stats.winRate}%</p>
          </div>
          <div>
            <p className="text-caption text-muted">Match dihitung rating</p>
            <p className="text-h1">{player.matchesCounted}</p>
          </div>
        </Card>
      )}

      {stats.ratingSeries.length >= 2 ? (
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-h3">Rating Progress</h2>
          <RatingChart points={stats.ratingSeries} />
        </Card>
      ) : (
        <EmptyState
          icon={<ChartColumn aria-hidden />}
          title="Grafik progress muncul setelah match Competitive pertama."
          description="Main match Competitive dan konfirmasi hasilnya untuk melihat rating kamu bergerak."
          action={
            <Link href="/mabar?type=COMPETITIVE" className={buttonClasses()}>
              Cari Mabar Competitive
            </Link>
          }
        />
      )}

      {stats.recentForm.length > 0 && (
        <Card className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-h3">Recent Form</h2>
            <Link href="/matches#history" className="min-h-11 content-center text-body-sm font-semibold text-muted hover:text-ink">
              Lihat riwayat
            </Link>
          </div>
          <RecentForm form={stats.recentForm} />
        </Card>
      )}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-56 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}

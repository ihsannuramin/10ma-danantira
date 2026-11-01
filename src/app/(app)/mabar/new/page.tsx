import type { Metadata } from "next";
import { Suspense } from "react";
import { CreateMabarForm } from "@/components/mabar/create-mabar-form";
import { Page, TopBar } from "@/components/layout/top-bar";
import { Skeleton } from "@/components/ui/card";
import { requirePlayer } from "@/data/auth";
import { getAreas, getVenues } from "@/data/reference";
import { DEFAULT_LEVEL_RANGE, LEVEL_RANGE_MAX, LEVEL_RANGE_MIN, LEVEL_STEP } from "@/domain/mabar/mabar.constants";
import { wibDateString } from "@/domain/mabar/schedule";

export const metadata: Metadata = { title: "Create Mabar" };

export default function CreateMabarPage() {
  return (
    <Page>
      <TopBar title="Create Mabar" backHref="/mabar" />
      <Suspense fallback={<FormSkeleton />}>
        <CreateMabar />
      </Suspense>
    </Page>
  );
}

/** A ±0.5 band around the organizer's rating, snapped to the 0.5 grid. */
function levelAround(rating: number) {
  const snap = (v: number) => Math.round(v / LEVEL_STEP) * LEVEL_STEP;
  const min = Math.max(LEVEL_RANGE_MIN, snap(rating - 0.5));
  const max = Math.min(LEVEL_RANGE_MAX, snap(rating + 0.5));
  return min < max ? { min, max } : DEFAULT_LEVEL_RANGE;
}

async function CreateMabar() {
  const [player, venues, areas] = await Promise.all([requirePlayer(), getVenues(), getAreas()]);
  return (
    <CreateMabarForm
      venues={venues}
      areas={areas}
      playerAreaId={player.areaId}
      minDate={wibDateString(new Date())}
      defaultLevel={levelAround(player.rating)}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );
}

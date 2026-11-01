import { CalendarDays, MapPin, UsersRound } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, Skeleton } from "@/components/ui/card";
import type { MabarListing } from "@/data/mabar";
import { FORMAT_LABEL, MATCH_TYPE_LABEL } from "@/domain/mabar/mabar.constants";
import { formatLevelRange, formatRupiah, formatShortDate, formatTimeRange } from "@/lib/format";
import { MabarStatusBadge } from "./status-badge";

/**
 * The app's main component (Design.md §15). Information order:
 * availability, name, when, where, level, format, players, price, CTA.
 */
export function MabarCard({ mabar, viewerRating, joined = false }: { mabar: MabarListing; viewerRating: number; joined?: boolean }) {
  const open = mabar.effectiveStatus === "OPEN" && !joined;
  return (
    <Card className="relative flex flex-col gap-3 p-4 transition-colors focus-within:border-ink hover:border-ink/40">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <MabarStatusBadge
            status={mabar.effectiveStatus}
            levelMin={mabar.levelMin}
            levelMax={mabar.levelMax}
            viewer={{ rating: viewerRating, joined }}
          />
          {mabar.matchType === "COMPETITIVE" && <Badge tone="dark">{MATCH_TYPE_LABEL.COMPETITIVE}</Badge>}
        </div>
        <span className="flex items-center gap-1 text-body-sm font-bold">
          <UsersRound className="size-4" aria-hidden />
          {mabar.participantCount}/{mabar.maxPlayers}
          <span className="sr-only">players</span>
        </span>
      </div>

      <h3 className="text-h3">
        {/* Stretched link: the whole card is one tap target. */}
        <Link href={`/mabar/${mabar.id}`} className="after:absolute after:inset-0 after:rounded-lg focus:outline-none">
          {mabar.title}
        </Link>
      </h3>

      <dl className="flex flex-col gap-1.5 text-body-sm text-muted">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Waktu</dt>
          <CalendarDays className="size-4 shrink-0" aria-hidden />
          <dd>
            {formatShortDate(mabar.startsAt)} • {formatTimeRange(mabar.startsAt, mabar.endsAt)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Lokasi</dt>
          <MapPin className="size-4 shrink-0" aria-hidden />
          <dd className="truncate">
            {mabar.venueName} · {mabar.areaName}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="sr-only">Level dan format</dt>
          <span className="w-4 shrink-0 text-center font-bold" aria-hidden>
            ★
          </span>
          <dd>
            Level {formatLevelRange(mabar.levelMin, mabar.levelMax)} • {FORMAT_LABEL[mabar.format]}
          </dd>
        </div>
      </dl>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-body font-bold">
          {mabar.costPerPlayer !== null ? (
            <>
              {formatRupiah(mabar.costPerPlayer)}
              <span className="text-body-sm font-normal text-muted"> / player</span>
            </>
          ) : (
            <span className="text-body-sm font-normal text-muted">Biaya belum ditentukan</span>
          )}
        </p>
        <span
          aria-hidden
          className={
            open
              ? "inline-flex h-10 items-center rounded-md bg-lime px-5 text-body-sm font-bold"
              : "inline-flex h-10 items-center rounded-md border border-line px-4 text-body-sm font-bold"
          }
        >
          {open ? "Join" : "Lihat"}
        </span>
      </div>
    </Card>
  );
}

export function MabarCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-5 w-10" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex justify-between border-t border-line pt-3">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-10 w-20" />
      </div>
    </Card>
  );
}

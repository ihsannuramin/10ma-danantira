import { CalendarDays, MapPin, Plus, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CourtIllustration } from "@/components/mabar/court-illustration";
import { JoinPanel } from "@/components/mabar/join-panel";
import { MabarStatusBadge } from "@/components/mabar/status-badge";
import { Page, TopBar } from "@/components/layout/top-bar";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/state";
import { requirePlayer } from "@/data/auth";
import { getMabarDetail } from "@/data/mabar";
import { FORMAT_LABEL, MATCH_TYPE_LABEL } from "@/domain/mabar/mabar.constants";
import { canJoin } from "@/domain/mabar/mabar.service";
import { formatRating } from "@/domain/rating/rating.service";
import { formatLevelRange, formatLongDate, formatRupiah, formatTimeRange } from "@/lib/format";

export const metadata: Metadata = { title: "Match Details" };

export default function MabarDetailPage({ params }: PageProps<"/mabar/[id]">) {
  return (
    <Page>
      <TopBar title="Match Details" backHref="/mabar" />
      <Suspense fallback={<DetailSkeleton />}>
        <Detail params={params} />
      </Suspense>
    </Page>
  );
}

async function Detail({ params }: { params: PageProps<"/mabar/[id]">["params"] }) {
  const { id } = await params;
  const [player, mabar] = await Promise.all([requirePlayer(`/mabar/${id}`), getMabarDetail(id)]);

  if (!mabar) {
    return (
      <ErrorState
        title="Mabar tidak ditemukan."
        description="Mungkin link-nya salah atau mabar sudah dihapus."
        action={
          <Link href="/mabar" className={buttonClasses()}>
            <SearchX className="size-5" aria-hidden />
            Cari Mabar Lain
          </Link>
        }
      />
    );
  }

  const isParticipant = mabar.participants.some((p) => p.userId === player.id);
  const isOrganizer = mabar.organizerId === player.id;
  const check = canJoin({
    hasProfile: true,
    playerRating: player.rating,
    mabar: { ...mabar, isParticipant },
  });
  // Free slots only mean something while the mabar can still be joined.
  const openSlots = mabar.effectiveStatus === "OPEN" ? Math.max(0, mabar.maxPlayers - mabar.participantCount) : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="relative overflow-hidden rounded-lg">
        <CourtIllustration className="h-36 w-full md:h-44" />
        <div className="absolute left-3 top-3">
          <MabarStatusBadge
            status={mabar.effectiveStatus}
            levelMin={mabar.levelMin}
            levelMax={mabar.levelMax}
            viewer={{ rating: player.rating, joined: isParticipant }}
          />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-h1">{mabar.title}</h2>
        <ul className="flex flex-col gap-2 text-body text-ink">
          <li className="flex items-center gap-2">
            <CalendarDays className="size-5 shrink-0 text-muted" aria-hidden />
            {formatLongDate(mabar.startsAt)} • {formatTimeRange(mabar.startsAt, mabar.endsAt)}
          </li>
          <li className="flex items-center gap-2">
            <MapPin className="size-5 shrink-0 text-muted" aria-hidden />
            {mabar.venueName}, {mabar.areaName}
          </li>
        </ul>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Level: {formatLevelRange(mabar.levelMin, mabar.levelMax)}</Badge>
          <Badge tone="neutral">{FORMAT_LABEL[mabar.format]}</Badge>
          <Badge tone={mabar.matchType === "COMPETITIVE" ? "dark" : "neutral"}>{MATCH_TYPE_LABEL[mabar.matchType]}</Badge>
          <Badge tone="lime">
            {mabar.costPerPlayer !== null ? `${formatRupiah(mabar.costPerPlayer)} / player` : "Biaya belum ditentukan"}
          </Badge>
        </div>
        {mabar.matchType === "COMPETITIVE" && (
          <p className="text-caption text-muted">Hasil match ini akan mengubah rating setelah dikonfirmasi lawan.</p>
        )}
      </section>

      {mabar.description && (
        <Card className="p-4">
          <h3 className="mb-1 text-body-sm font-semibold">Catatan dari organizer</h3>
          <p className="whitespace-pre-line text-body-sm text-muted">{mabar.description}</p>
        </Card>
      )}

      <section aria-labelledby="players-heading" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 id="players-heading" className="text-h3">
            Players
          </h3>
          <p className="text-body-sm font-bold">
            {mabar.participantCount} / {mabar.maxPlayers}
          </p>
        </div>
        <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-white">
          {mabar.participants.map((p) => (
            <li key={p.userId} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={p.displayName} src={p.photoUrl} />
              <div className="flex-1">
                <p className="font-semibold">
                  {p.displayName}
                  {p.userId === player.id && <span className="font-normal text-muted"> (kamu)</span>}
                </p>
                <p className="text-caption text-muted">Rating {p.rating !== null ? formatRating(p.rating) : "–"}</p>
              </div>
              {p.userId === mabar.organizerId && <Badge tone="dark">Organizer</Badge>}
            </li>
          ))}
          {openSlots > 0 && (
            <li className="flex items-center gap-3 px-4 py-3 text-muted">
              <span className="flex size-11 items-center justify-center rounded-full border-2 border-dashed border-line">
                <Plus className="size-4" aria-hidden />
              </span>
              {openSlots} slot available
            </li>
          )}
        </ul>
      </section>

      <JoinPanel
        mabarId={mabar.id}
        status={mabar.effectiveStatus}
        isOrganizer={isOrganizer}
        isParticipant={isParticipant}
        joinBlockedBy={check.ok ? null : check.code}
        share={{
          title: mabar.title,
          startsAt: mabar.startsAt,
          endsAt: mabar.endsAt,
          venueName: mabar.venueName,
          levelMin: mabar.levelMin,
          levelMax: mabar.levelMax,
          format: mabar.format,
          participantCount: mabar.participantCount,
          maxPlayers: mabar.maxPlayers,
          costPerPlayer: mabar.costPerPlayer,
        }}
      />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-36 w-full rounded-lg" />
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}

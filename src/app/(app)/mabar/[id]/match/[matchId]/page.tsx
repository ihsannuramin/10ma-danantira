import { Clock, SearchX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmResultCard } from "@/components/match/confirm-result-card";
import { CancelMatchButton, RefreshButton } from "@/components/match/match-actions";
import { MatchCompleted } from "@/components/match/match-completed";
import { ScoreBoard } from "@/components/match/score-board";
import { ScoreEditor } from "@/components/match/score-editor";
import { Page, TopBar } from "@/components/layout/top-bar";
import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { Alert, ErrorState } from "@/components/ui/state";
import { requirePlayer } from "@/data/auth";
import { getMatch, getRatingChange } from "@/data/match";
import { MATCH_TYPE_LABEL } from "@/domain/mabar/mabar.constants";
import { SCORING_FORMAT_INFO } from "@/domain/match/match.constants";

export const metadata: Metadata = { title: "Live Match" };

export default function MatchPage({ params }: PageProps<"/mabar/[id]/match/[matchId]">) {
  return (
    <Page>
      <Suspense fallback={<MatchSkeleton />}>
        <MatchContent params={params} />
      </Suspense>
    </Page>
  );
}

function hoursUntil(date: Date | null): number {
  if (!date) return 0;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 3_600_000));
}

async function MatchContent({ params }: { params: PageProps<"/mabar/[id]/match/[matchId]">["params"] }) {
  const { id, matchId } = await params;
  const [player, match] = await Promise.all([requirePlayer(`/mabar/${id}/match/${matchId}`), getMatch(matchId)]);

  if (!match || match.mabarId !== id) {
    return (
      <>
        <TopBar title="Match" backHref={`/mabar/${id}`} />
        <ErrorState
          title="Match tidak ditemukan."
          description="Mungkin sudah dibatalkan organizer."
          action={
            <Link href={`/mabar/${id}`} className={buttonClasses()}>
              <SearchX className="size-5" aria-hidden />
              Kembali ke Mabar
            </Link>
          }
        />
      </>
    );
  }

  const isOrganizer = match.organizerId === player.id;
  const isPlayer = match.playerIds.includes(player.id);
  const result = match.result;
  const title = match.status === "LIVE" ? "Live Match" : `Match #${match.seqNo}`;
  const nameOf = (userId: string | null) =>
    [...match.teamA, ...match.teamB].find((p) => p.userId === userId)?.name ?? "Pemain";

  const header = (
    <>
      <TopBar title={title} backHref={`/mabar/${id}`} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="neutral">Match #{match.seqNo}</Badge>
        <Badge tone="neutral">{SCORING_FORMAT_INFO[match.scoringFormat].label}</Badge>
        <Badge tone={match.matchType === "COMPETITIVE" ? "dark" : "neutral"}>{MATCH_TYPE_LABEL[match.matchType]}</Badge>
      </div>
    </>
  );

  if (match.status === "COMPLETED" && result) {
    const change = isPlayer ? await getRatingChange(match.id, player.id) : null;
    return (
      <>
        {header}
        <MatchCompleted match={match} viewerId={player.id} ratingChange={change} />
      </>
    );
  }

  if (match.status === "CANCELLED") {
    return (
      <>
        {header}
        <ErrorState
          title="Match ini dibatalkan."
          description="Skornya tidak dihitung dan tidak masuk riwayat."
          action={
            <Link href={`/mabar/${id}`} className={buttonClasses()}>
              Kembali ke Mabar
            </Link>
          }
        />
      </>
    );
  }

  const editor = (resubmit: boolean) => (
    <ScoreEditor
      key={result?.version ?? 0}
      matchId={match.id}
      format={match.scoringFormat}
      teamA={match.teamA}
      teamB={match.teamB}
      initialSets={match.sets}
      resubmit={resubmit}
    />
  );

  // LIVE: organizer scores, everyone else watches.
  if (match.status === "LIVE") {
    return (
      <>
        {header}
        <div className="flex flex-col gap-4">
          {isOrganizer ? (
            editor(false)
          ) : (
            <>
              <ScoreBoard teamA={match.teamA} teamB={match.teamB} sets={match.sets} live />
              <p className="text-center text-body-sm text-muted">Organizer sedang mencatat skor.</p>
              <div className="flex justify-center">
                <RefreshButton />
              </div>
            </>
          )}
          {isOrganizer && (
            <div className="flex justify-center">
              <CancelMatchButton matchId={match.id} mabarId={id} />
            </div>
          )}
        </div>
      </>
    );
  }

  // PENDING_CONFIRMATION: waiting on a player, or rejected and back with the organizer.
  const rejected = result?.status === "REJECTED";
  const canConfirm = result?.status === "PENDING" && isPlayer && result.submittedBy !== player.id;

  return (
    <>
      {header}
      <div className="flex flex-col gap-4">
        {rejected ? (
          <Alert
            title={`Hasil ditolak oleh ${nameOf(result!.rejectedBy)}.`}
            description={result!.rejectionReason ?? (isOrganizer ? "Perbaiki skornya lalu kirim ulang." : "Organizer sedang memperbaiki skor.")}
          />
        ) : canConfirm ? null : (
          <p className="flex items-center gap-2 rounded-md border border-line bg-white px-4 py-3 text-body-sm">
            <Clock className="size-5 shrink-0 text-muted" aria-hidden />
            Menunggu konfirmasi pemain. Otomatis official dalam {hoursUntil(result?.deadline ?? null)} jam.
          </p>
        )}

        {isOrganizer && rejected ? editor(true) : <ScoreBoard teamA={match.teamA} teamB={match.teamB} sets={match.sets} winner={result?.winner} />}

        {canConfirm && <ConfirmResultCard matchId={match.id} hoursLeft={hoursUntil(result!.deadline)} />}

        {isOrganizer && !rejected && (
          <details className="rounded-lg border border-line bg-white p-4">
            <summary className="min-h-11 cursor-pointer content-center text-body-sm font-bold">Salah input? Perbaiki skor</summary>
            <div className="mt-4">{editor(true)}</div>
          </details>
        )}
        {isOrganizer && (
          <div className="flex justify-center">
            <CancelMatchButton matchId={match.id} mabarId={id} />
          </div>
        )}
      </div>
    </>
  );
}

function MatchSkeleton() {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-6 w-56" />
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

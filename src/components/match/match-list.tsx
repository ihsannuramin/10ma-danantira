import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { MatchSummary } from "@/data/match";
import { formatScoreLine } from "@/domain/match/scoring";
import { teamName } from "./score-board";

export function matchStatusBadge(match: MatchSummary, viewerId: string): { tone: BadgeTone; label: string } {
  if (match.status === "LIVE") return { tone: "live", label: "LIVE" };
  if (match.status === "CANCELLED") return { tone: "neutral", label: "Dibatalkan" };
  if (match.status === "COMPLETED") return { tone: "dark", label: "Selesai" };
  if (match.result?.status === "REJECTED") return { tone: "danger", label: "Ditolak" };
  const canConfirm = match.playerIds.includes(viewerId) && match.result?.submittedBy !== viewerId;
  return canConfirm ? { tone: "lime", label: "Perlu konfirmasi kamu" } : { tone: "warning", label: "Menunggu konfirmasi" };
}

/** Matches of a session, newest first. */
export function MatchList({ matches, mabarId, viewerId }: { matches: MatchSummary[]; mabarId: string; viewerId: string }) {
  return (
    <ul className="flex flex-col divide-y divide-line rounded-lg border border-line bg-white">
      {matches.map((m) => {
        const badge = matchStatusBadge(m, viewerId);
        return (
          <li key={m.id}>
            <Link href={`/mabar/${mabarId}/match/${m.id}`} className="flex min-h-16 items-center gap-3 px-4 py-3">
              <span className="w-8 shrink-0 text-caption font-bold text-muted">#{m.seqNo}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-sm font-semibold">
                  {teamName(m.teamA)} <span className="text-muted">vs</span> {teamName(m.teamB)}
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-2">
                  <Badge tone={badge.tone} dot={badge.tone === "live"}>
                    {badge.label}
                  </Badge>
                  {m.sets.length > 0 && <span className="text-caption font-semibold tabular-nums">{formatScoreLine(m.sets)}</span>}
                </span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

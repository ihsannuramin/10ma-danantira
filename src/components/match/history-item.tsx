import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { HistoryEntry } from "@/data/match";
import { FORMAT_LABEL, MATCH_TYPE_LABEL } from "@/domain/mabar/mabar.constants";
import { formatScoreLine } from "@/domain/match/scoring";
import { formatShortDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const firstName = (name: string) => name.split(" ")[0]!;

/** One completed match from the player's point of view (PRD §20). */
export function HistoryItem({ entry }: { entry: HistoryEntry }) {
  return (
    <li>
      <Link href={`/mabar/${entry.mabarId}/match/${entry.matchId}`} className="flex min-h-16 items-center gap-3 px-4 py-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full text-body font-extrabold",
            entry.won ? "bg-lime text-ink" : "bg-soft text-muted",
          )}
          aria-label={entry.won ? "Menang" : "Kalah"}
        >
          {entry.won ? "W" : "L"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-body-sm font-semibold">
            vs {entry.opponentNames.map(firstName).join(" + ")}
            {entry.partnerNames.length > 0 && <span className="font-normal text-muted"> · bareng {entry.partnerNames.map(firstName).join(", ")}</span>}
          </span>
          <span className="block text-caption text-muted">
            {formatShortDate(entry.completedAt)} · {FORMAT_LABEL[entry.format]} · {entry.venueName}
          </span>
          <span className="mt-1 flex items-center gap-2">
            <span className="text-body-sm font-bold tabular-nums">{formatScoreLine(entry.sets, entry.team)}</span>
            <Badge tone={entry.matchType === "COMPETITIVE" ? "dark" : "neutral"}>{MATCH_TYPE_LABEL[entry.matchType]}</Badge>
          </span>
        </span>
        {entry.ratingDelta !== null && (
          <span className={cn("shrink-0 text-body-sm font-bold tabular-nums", entry.ratingDelta >= 0 ? "text-green-700" : "text-muted")}>
            {entry.ratingDelta >= 0 ? "+" : ""}
            {entry.ratingDelta.toFixed(2)}
          </span>
        )}
      </Link>
    </li>
  );
}

import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Player } from "@/data/auth";
import { formatRating, levelLabel } from "@/domain/rating/rating.service";

/**
 * Current rating, its level and how confident we are in it (Design.md §27).
 * `compact` is the Home summary; the full card adds reliability and record.
 * Rating change over time arrives with match results in iteration 2.
 */
export function RatingCard({ player, compact = false }: { player: Player; compact?: boolean }) {
  if (compact) {
    return (
      <Card className="flex items-center gap-4 p-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-lime">
          <Star className="size-6 fill-ink" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-caption text-muted">Rating kamu</p>
          <p className="text-h2">{formatRating(player.rating)}</p>
        </div>
        <p className="text-right text-body-sm font-semibold">{levelLabel(player.level)}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-3">
        <Star className="size-8 fill-lime text-ink" aria-hidden />
        <p className="text-display">{formatRating(player.rating)}</p>
        <p className="ml-auto rounded-full bg-ink px-3 py-1 text-caption font-semibold text-lime">{levelLabel(player.level)}</p>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-line text-center">
        <div>
          <dd className="text-h2">{player.matchesCounted}</dd>
          <dt className="text-caption text-muted">Matches</dt>
        </div>
        <div>
          <dd className="text-h2">0</dd>
          <dt className="text-caption text-muted">Wins</dt>
        </div>
        <div>
          <dd className="text-h2">0</dd>
          <dt className="text-caption text-muted">Losses</dt>
        </div>
      </dl>
      <div>
        <div
          className="h-2 overflow-hidden rounded-full bg-soft"
          role="progressbar"
          aria-label="Reliability rating"
          aria-valuenow={player.reliability}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-lime" style={{ width: `${player.reliability}%` }} />
        </div>
        <p className="mt-1.5 text-caption font-semibold">Reliability: {player.reliability}%</p>
      </div>
    </Card>
  );
}

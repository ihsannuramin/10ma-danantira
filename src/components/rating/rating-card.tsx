import { Star, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Player } from "@/data/auth";
import type { PlayerStats } from "@/data/match";
import { TENNIS_LEVELS } from "@/domain/rating/rating.constants";
import { formatRating, levelLabel } from "@/domain/rating/rating.service";
import { cn } from "@/lib/cn";

type CardStats = Pick<PlayerStats, "matches" | "wins" | "losses" | "monthDelta">;

function MonthDelta({ delta }: { delta: number }) {
  if (delta === 0) return null;
  const up = delta > 0;
  return (
    <span className={cn("inline-flex items-center gap-1 text-body-sm font-bold", up ? "text-green-700" : "text-muted")}>
      {up ? <TrendingUp className="size-4" aria-hidden /> : <TrendingDown className="size-4" aria-hidden />}
      {up ? "+" : ""}
      {delta.toFixed(2)} bulan ini
    </span>
  );
}

/**
 * Current rating, direction and confidence (Design.md §27). `compact` is the
 * Home summary. Reliability is shown from Intermediate up, so beginners see
 * only level, rating and matches (progressive disclosure, Design.md §2.4).
 */
export function RatingCard({ player, stats, compact = false }: { player: Player; stats: CardStats; compact?: boolean }) {
  const showReliability = TENNIS_LEVELS.indexOf(player.level) >= TENNIS_LEVELS.indexOf("INTERMEDIATE");

  if (compact) {
    return (
      <Card className="flex items-center gap-4 p-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-lime">
          <Star className="size-6 fill-ink" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-caption text-muted">Rating kamu</p>
          <p className="text-h2">{formatRating(player.rating)}</p>
          <MonthDelta delta={stats.monthDelta} />
        </div>
        <p className="text-right text-body-sm font-semibold">{levelLabel(player.level)}</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Star className="size-8 fill-lime text-ink" aria-hidden />
        <div>
          <p className="text-display">{formatRating(player.rating)}</p>
          <MonthDelta delta={stats.monthDelta} />
        </div>
        <p className="ml-auto rounded-full bg-ink px-3 py-1 text-caption font-semibold text-lime">{levelLabel(player.level)}</p>
      </div>
      <dl className="grid grid-cols-3 divide-x divide-line text-center">
        <div>
          <dd className="text-h2">{stats.matches}</dd>
          <dt className="text-caption text-muted">Matches</dt>
        </div>
        <div>
          <dd className="text-h2">{stats.wins}</dd>
          <dt className="text-caption text-muted">Wins</dt>
        </div>
        <div>
          <dd className="text-h2">{stats.losses}</dd>
          <dt className="text-caption text-muted">Losses</dt>
        </div>
      </dl>
      {showReliability && (
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
      )}
    </Card>
  );
}

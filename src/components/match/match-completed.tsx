import { ArrowDown, ArrowUp, Trophy } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import type { MatchSummary, MyRatingChange } from "@/data/match";
import { formatRating } from "@/domain/rating/rating.service";
import { cn } from "@/lib/cn";
import { ScoreBoard, teamName } from "./score-board";

/** The rewarding end screen (Design.md §22): result, score, and the viewer's rating move. */
export function MatchCompleted({
  match,
  viewerId,
  ratingChange,
}: {
  match: MatchSummary;
  viewerId: string;
  ratingChange: MyRatingChange | null;
}) {
  const winner = match.result!.winner;
  const viewerTeam = match.teamA.some((p) => p.userId === viewerId) ? "A" : match.teamB.some((p) => p.userId === viewerId) ? "B" : null;
  const won = viewerTeam === winner;
  const auto = match.result!.status === "AUTO_CONFIRMED";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-2 rounded-lg bg-ink px-4 py-8 text-center text-white">
        <span className="flex size-16 items-center justify-center rounded-full bg-lime text-ink">
          <Trophy className="size-8" aria-hidden />
        </span>
        <h2 className="text-display">Match Completed!</h2>
        <p className="text-body text-white/80">
          {viewerTeam ? (won ? "Kamu menang. Mantap!" : "Belum rezeki. Main lagi yuk!") : `Pemenang: ${teamName(winner === "A" ? match.teamA : match.teamB)}`}
        </p>
        {auto && <p className="text-caption text-white/60">Official otomatis setelah 24 jam tanpa konfirmasi.</p>}
      </div>

      <ScoreBoard teamA={match.teamA} teamB={match.teamB} sets={match.sets} winner={winner} />

      {viewerTeam &&
        (match.matchType === "COMPETITIVE" && ratingChange ? (
          <div className="flex items-center gap-4 rounded-lg border border-line bg-white p-5">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-full",
                ratingChange.delta >= 0 ? "bg-lime text-ink" : "bg-soft text-muted",
              )}
            >
              {ratingChange.delta >= 0 ? <ArrowUp className="size-6" aria-hidden /> : <ArrowDown className="size-6" aria-hidden />}
            </span>
            <div className="flex-1">
              <p className="text-caption text-muted">Rating Updated</p>
              <p className="text-h2 tabular-nums">
                {formatRating(ratingChange.before)} → {formatRating(ratingChange.after)}
              </p>
            </div>
            <p className={cn("text-h3 tabular-nums", ratingChange.delta >= 0 ? "text-green-700" : "text-muted")}>
              {ratingChange.delta >= 0 ? "+" : ""}
              {ratingChange.delta.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-white p-4 text-center text-body-sm text-muted">
            Match Casual — rating kamu tidak berubah.
          </p>
        ))}

      <div className="flex flex-col gap-3">
        <Link href={`/mabar/${match.mabarId}`} className={buttonClasses({ fullWidth: true })}>
          Kembali ke Mabar
        </Link>
        <Link href="/mabar" className={buttonClasses({ variant: "ghost", fullWidth: true })}>
          Main lagi
        </Link>
      </div>
    </div>
  );
}

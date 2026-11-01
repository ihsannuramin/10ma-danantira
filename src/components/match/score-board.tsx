import { Trophy } from "lucide-react";
import type { MatchPlayer, MatchSet } from "@/data/match";
import type { Team } from "@/domain/match/match.constants";
import { cn } from "@/lib/cn";

const teamName = (players: MatchPlayer[]) => players.map((p) => p.name.split(" ")[0]).join(" + ") || "—";

/** Dark scoreboard from the showcase: one row per team, one column per set. */
export function ScoreBoard({
  teamA,
  teamB,
  sets,
  winner,
  live = false,
}: {
  teamA: MatchPlayer[];
  teamB: MatchPlayer[];
  sets: MatchSet[];
  winner?: Team | null;
  live?: boolean;
}) {
  const rows: { team: Team; players: MatchPlayer[] }[] = [
    { team: "A", players: teamA },
    { team: "B", players: teamB },
  ];
  return (
    <div className="overflow-hidden rounded-lg bg-ink text-white">
      <table className="w-full table-fixed">
        <caption className="sr-only">Skor match{live ? " (sedang berlangsung)" : ""}</caption>
        <thead>
          <tr className="text-caption text-white/60">
            <th scope="col" className="px-4 pt-3 text-left font-semibold">
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-danger px-2 py-0.5 text-white">
                  <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                  LIVE
                </span>
              )}
            </th>
            {sets.map((s) => (
              <th key={s.setNo} scope="col" className="w-14 pt-3 text-center font-semibold">
                {s.isMatchTiebreak ? "STB" : `Set ${s.setNo}`}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ team, players }) => (
            <tr key={team} className={cn(winner && winner !== team && "text-white/50")}>
              <th scope="row" className="px-4 py-3 text-left">
                <span className="block text-caption font-semibold text-lime">Team {team}</span>
                <span className="flex items-center gap-1.5 truncate text-body font-bold">
                  {teamName(players)}
                  {winner === team && <Trophy className="size-4 shrink-0 text-lime" aria-label="Pemenang" />}
                </span>
              </th>
              {sets.map((s) => {
                const games = team === "A" ? s.gamesA : s.gamesB;
                const tb = team === "A" ? s.tiebreakA : s.tiebreakB;
                const wonSet = team === "A" ? s.gamesA > s.gamesB : s.gamesB > s.gamesA;
                return (
                  <td key={s.setNo} className={cn("py-3 text-center text-h1 tabular-nums", wonSet && "text-lime")}>
                    {games}
                    {tb !== null && <sup className="ml-0.5 text-caption text-white/70">{tb}</sup>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {sets.length === 0 && <p className="px-4 pb-4 text-body-sm text-white/60">Skor belum diisi.</p>}
    </div>
  );
}

export { teamName };

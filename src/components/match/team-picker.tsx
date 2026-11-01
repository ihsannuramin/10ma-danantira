"use client";

import { Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { startMatch } from "@/actions/match";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/state";
import { MIN_PLAYERS } from "@/domain/mabar/mabar.constants";
import type { MabarFormat } from "@/domain/mabar/mabar.types";
import type { Team } from "@/domain/match/match.constants";
import { suggestNextMatch } from "@/domain/match/rotation";
import { cn } from "@/lib/cn";
import type { UserError } from "@/lib/errors";

export type PickablePlayer = { userId: string; name: string; photoUrl: string | null; played: number };

/** Organizer picks who plays the next match; "Saran rotasi" fills it fairly. */
export function TeamPicker({
  open,
  onClose,
  mabarId,
  format,
  players,
}: {
  open: boolean;
  onClose: () => void;
  mabarId: string;
  format: MabarFormat;
  players: PickablePlayer[];
}) {
  const router = useRouter();
  const perTeam = MIN_PLAYERS[format] / 2;
  const [teams, setTeams] = useState<Record<string, Team>>({});
  const [error, setError] = useState<UserError | null>(null);
  const [pending, startTransition] = useTransition();

  const teamA = players.filter((p) => teams[p.userId] === "A");
  const teamB = players.filter((p) => teams[p.userId] === "B");
  const ready = teamA.length === perTeam && teamB.length === perTeam;

  /** Tap cycles a player: bench → Team A → Team B → bench (skipping a full team). */
  function cycle(id: string) {
    setTeams((current) => {
      const next = { ...current };
      const count = (t: Team) => Object.entries(next).filter(([k, v]) => v === t && k !== id).length;
      const order: (Team | undefined)[] = [undefined, "A", "B"];
      let i = order.indexOf(next[id]);
      for (let step = 0; step < 3; step++) {
        i = (i + 1) % 3;
        const target = order[i];
        if (target === undefined || count(target) < perTeam) break;
      }
      if (order[i]) next[id] = order[i]!;
      else delete next[id];
      return next;
    });
  }

  function suggest() {
    const counts = Object.fromEntries(players.map((p) => [p.userId, p.played]));
    const s = suggestNextMatch(players.map((p) => p.userId), counts, format);
    if (!s) return;
    setTeams(Object.fromEntries([...s.teamA.map((id) => [id, "A" as Team]), ...s.teamB.map((id) => [id, "B" as Team])]));
  }

  function start() {
    setError(null);
    startTransition(async () => {
      const result = await startMatch(mabarId, teamA.map((p) => p.userId), teamB.map((p) => p.userId));
      if (!result.ok) return setError(result.error);
      onClose();
      router.push(`/mabar/${mabarId}/match/${result.data.id}`);
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Mulai Match" description={`Pilih ${perTeam} pemain untuk tiap tim. Tap nama untuk pindah tim.`}>
      <div className="flex flex-col gap-4">
        <Button variant="secondary" size="sm" onClick={suggest} icon={<Shuffle className="size-4" aria-hidden />}>
          Saran rotasi
        </Button>
        <ul className="flex max-h-[45dvh] flex-col gap-2 overflow-y-auto">
          {players.map((p) => {
            const team = teams[p.userId];
            return (
              <li key={p.userId}>
                <button
                  type="button"
                  onClick={() => cycle(p.userId)}
                  aria-label={`${p.name}: ${team ? `Team ${team}` : "tidak main"}. Tap untuk ganti.`}
                  className={cn(
                    "flex min-h-14 w-full items-center gap-3 rounded-md border px-3 text-left transition-colors",
                    team === "A" && "border-ink bg-lime",
                    team === "B" && "border-ink bg-ink text-white",
                    !team && "border-line bg-white",
                  )}
                >
                  <Avatar name={p.name} src={p.photoUrl} size="sm" />
                  <span className="flex-1">
                    <span className="block font-semibold">{p.name}</span>
                    <span className={cn("block text-caption", team === "B" ? "text-white/70" : "text-muted")}>
                      {p.played}× main di sesi ini
                    </span>
                  </span>
                  <span className="text-caption font-bold">{team ? `Team ${team}` : "Bangku"}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {error && <Alert title={error.title} description={error.description} />}
        <Button onClick={start} disabled={!ready} loading={pending} fullWidth>
          {ready ? "Mulai Match" : `Pilih ${perTeam} vs ${perTeam}`}
        </Button>
      </div>
    </Modal>
  );
}

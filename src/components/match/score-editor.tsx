"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveMatchDraft, submitMatchResult } from "@/actions/match";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import type { MatchPlayer, MatchSet } from "@/data/match";
import { SCORING_FORMAT_INFO, SCORING_RULES, type ScoringFormat } from "@/domain/match/match.constants";
import { setNeedsTiebreak, validateScore, type ScoreError, type SetInput } from "@/domain/match/scoring";
import { cn } from "@/lib/cn";
import type { UserError } from "@/lib/errors";
import { teamName } from "./score-board";

type Draft = { a: number; b: number; tbA: number | null; tbB: number | null };

const fromSets = (sets: MatchSet[]): Draft[] =>
  sets.length > 0
    ? sets.map((s) => ({ a: s.gamesA, b: s.gamesB, tbA: s.tiebreakA, tbB: s.tiebreakB }))
    : [{ a: 0, b: 0, tbA: null, tbB: null }];

function Stepper({ label, value, onChange, max }: { label: string; value: number; onChange: (v: number) => void; max: number }) {
  const btn =
    "inline-flex size-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 active:bg-lime active:text-ink disabled:opacity-30";
  return (
    <div className="flex flex-col items-center gap-2" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`Tambah ${label}`}>
        <Plus className="size-6" aria-hidden />
      </button>
      <output className="text-[3.5rem] leading-none font-extrabold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 0} aria-label={`Kurangi ${label}`}>
        <Minus className="size-6" aria-hidden />
      </button>
    </div>
  );
}

/**
 * One-handed score entry (Design.md §21): set tabs, big ± controls per team,
 * tie-break points only when the score calls for them. Validation runs here
 * for instant feedback and again on the server before anything is recorded.
 */
export function ScoreEditor({
  matchId,
  format,
  teamA,
  teamB,
  initialSets,
  resubmit = false,
}: {
  matchId: string;
  format: ScoringFormat;
  teamA: MatchPlayer[];
  teamB: MatchPlayer[];
  initialSets: MatchSet[];
  resubmit?: boolean;
}) {
  const rules = SCORING_RULES[format];
  const router = useRouter();
  const toast = useToast();
  const [sets, setSets] = useState<Draft[]>(() => fromSets(initialSets));
  const [active, setActive] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<ScoreError[]>([]);
  const [error, setError] = useState<UserError | null>(null);
  const [pending, startTransition] = useTransition();

  const toInput = (list: Draft[]): SetInput[] => list.map((s) => ({ a: s.a, b: s.b, tbA: s.tbA, tbB: s.tbB }));
  const check = validateScore(format, toInput(sets));
  const errors = attempted ? (check.ok ? serverErrors : check.errors) : [];
  const errorForSet = (i: number) => errors.find((e) => e.set === i + 1)?.message;
  const matchError = errors.find((e) => e.set === null)?.message;

  const current = sets[active]!;
  const isMtb = rules.decidingMatchTiebreak && active === rules.maxSets - 1;
  const needsTb = !isMtb && setNeedsTiebreak(format, current.a, current.b);
  const maxValue = isMtb ? 30 : rules.games + 1;

  function update(patch: Partial<Draft>) {
    setSets((list) => list.map((s, i) => (i === active ? { ...s, ...patch } : s)));
    setServerErrors([]);
  }

  function addSet() {
    setSets((list) => [...list, { a: 0, b: 0, tbA: null, tbB: null }]);
    setActive(sets.length);
  }

  function removeSet() {
    setSets((list) => list.slice(0, -1));
    setActive((i) => Math.min(i, sets.length - 2));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const result = await saveMatchDraft(matchId, toInput(sets));
      if (result.ok) toast("Skor tersimpan.");
      else setError(result.error);
    });
  }

  function submit() {
    setAttempted(true);
    setError(null);
    if (!check.ok) return;
    startTransition(async () => {
      const result = await submitMatchResult(matchId, toInput(sets));
      if (result.ok) {
        toast(result.data.status === "PENDING" ? "Hasil terkirim. Menunggu konfirmasi pemain." : "Match selesai!");
        router.refresh();
        return;
      }
      setError(result.error);
      if ("scoreErrors" in result) setServerErrors(result.scoreErrors);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-ink p-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <p className="text-caption font-semibold text-white/60">{SCORING_FORMAT_INFO[format].label}</p>
          {rules.maxSets > 1 && (
            <div role="tablist" aria-label="Set" className="flex gap-1">
              {sets.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => setActive(i)}
                  className={cn(
                    "inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-body-sm font-bold",
                    i === active ? "bg-lime text-ink" : "bg-white/10 text-white",
                    errorForSet(i) && i !== active && "ring-2 ring-danger",
                  )}
                >
                  {rules.decidingMatchTiebreak && i === rules.maxSets - 1 ? "STB" : i + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-body-sm font-semibold text-white/80">
          {isMtb ? "Super Tie-Break (first to 10)" : `Set ${active + 1}`}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center gap-3">
            <p className="text-center">
              <span className="block text-caption font-semibold text-lime">Team A</span>
              <span className="block truncate text-body-sm font-bold">{teamName(teamA)}</span>
            </p>
            <Stepper label={`skor Team A set ${active + 1}`} value={current.a} max={maxValue} onChange={(a) => update({ a, tbA: null, tbB: null })} />
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-center">
              <span className="block text-caption font-semibold text-lime">Team B</span>
              <span className="block truncate text-body-sm font-bold">{teamName(teamB)}</span>
            </p>
            <Stepper label={`skor Team B set ${active + 1}`} value={current.b} max={maxValue} onChange={(b) => update({ b, tbA: null, tbB: null })} />
          </div>
        </div>

        {needsTb && (
          <fieldset className="mt-4 rounded-md bg-white/5 p-3">
            <legend className="px-1 text-caption font-semibold text-white/80">Poin tie-break</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["tbA", "tbB"] as const).map((key) => (
                <label key={key} className="flex flex-col items-center gap-1 text-caption text-white/70">
                  Team {key === "tbA" ? "A" : "B"}
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={99}
                    value={current[key] ?? ""}
                    onChange={(e) => update({ [key]: e.target.value === "" ? null : Number(e.target.value) })}
                    className="h-12 w-20 rounded-md border border-white/20 bg-transparent text-center text-h2 text-white focus:border-lime focus:outline-none"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        )}

        {errorForSet(active) && (
          <p role="alert" className="mt-3 rounded-md bg-danger/20 px-3 py-2 text-body-sm text-white">
            {errorForSet(active)}
          </p>
        )}

        <div className="mt-4 flex justify-center gap-2">
          {sets.length < rules.maxSets && (
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={addSet} icon={<Plus className="size-4" aria-hidden />}>
              Tambah set
            </Button>
          )}
          {sets.length > 1 && active === sets.length - 1 && (
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10" onClick={removeSet} icon={<Trash2 className="size-4" aria-hidden />}>
              Hapus set
            </Button>
          )}
        </div>
      </div>

      {error && <Alert title={error.title} description={matchError ?? error.description} />}
      {!error && matchError && <Alert title={matchError} />}
      {check.ok && (
        <p className="text-center text-body-sm font-semibold">
          Pemenang: Team {check.winner} ({teamName(check.winner === "A" ? teamA : teamB)})
        </p>
      )}

      <div className="flex gap-3">
        {/* Drafts only exist while the match is being played. */}
        {!resubmit && (
          <Button variant="secondary" onClick={save} disabled={pending} className="flex-1 whitespace-nowrap">
            Simpan
          </Button>
        )}
        <Button onClick={submit} loading={pending} className="flex-2">
          {resubmit ? "Kirim Ulang Hasil" : "Submit Result"}
        </Button>
      </div>
    </div>
  );
}

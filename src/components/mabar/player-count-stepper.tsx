"use client";

import { Minus, Plus, Repeat } from "lucide-react";
import { FieldError } from "@/components/ui/field";

/** Session size: the players for one match, plus anyone who rotates in. */
export function PlayerCountStepper({
  value,
  min,
  max,
  onStep,
  error,
}: {
  value: number;
  min: number;
  max: number;
  /** +1 / -1; the parent clamps, so fast repeated taps are never lost. */
  onStep: (delta: number) => void;
  error?: string;
}) {
  const waiting = value - min;
  const button =
    "inline-flex size-12 items-center justify-center rounded-md border border-line bg-white text-ink transition-colors hover:border-ink/40 disabled:opacity-40";
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="mb-1.5 text-body-sm font-semibold">Jumlah pemain</legend>
      <input type="hidden" name="maxPlayers" value={value} />
      <div className="flex items-center gap-3">
        <button type="button" className={button} onClick={() => onStep(-1)} disabled={value <= min} aria-label="Kurangi pemain">
          <Minus className="size-5" aria-hidden />
        </button>
        <output className="w-16 text-center text-h1" aria-live="polite">
          {value}
        </output>
        <button type="button" className={button} onClick={() => onStep(1)} disabled={value >= max} aria-label="Tambah pemain">
          <Plus className="size-5" aria-hidden />
        </button>
      </div>
      <p className="flex items-center gap-1.5 text-caption text-muted">
        {waiting > 0 ? (
          <>
            <Repeat className="size-3.5" aria-hidden />
            Rotasi: {min} main, {waiting} gantian menunggu. Maks {max} pemain per court.
          </>
        ) : (
          `${min} pemain, 1 match. Tambah pemain untuk mabar rotasi.`
        )}
      </p>
      <FieldError id="maxPlayers" error={error} />
    </fieldset>
  );
}

"use client";

import { useState } from "react";
import { LEVEL_RANGE_MAX, LEVEL_RANGE_MIN, LEVEL_STEP } from "@/domain/mabar/mabar.constants";
import { levelFromRating, levelLabel } from "@/domain/rating/rating.service";
import { FieldError } from "@/components/ui/field";

const pct = (v: number) => ((v - LEVEL_RANGE_MIN) / (LEVEL_RANGE_MAX - LEVEL_RANGE_MIN)) * 100;

// Two native range inputs stacked on one track; only their thumbs take
// pointer events, so each stays independently draggable and keyboard-operable.
const thumb =
  "pointer-events-none absolute inset-0 h-11 w-full appearance-none bg-transparent focus:outline-none " +
  "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 [&::-webkit-slider-thumb]:appearance-none " +
  "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink " +
  "[&::-webkit-slider-thumb]:bg-lime [&::-webkit-slider-thumb]:cursor-grab " +
  "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-6 [&::-moz-range-thumb]:rounded-full " +
  "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-lime " +
  "focus-visible:[&::-webkit-slider-thumb]:outline-2 focus-visible:[&::-webkit-slider-thumb]:outline-offset-2 focus-visible:[&::-webkit-slider-thumb]:outline-ink";

export function LevelRangeSlider({
  defaultMin,
  defaultMax,
  error,
}: {
  defaultMin: number;
  defaultMax: number;
  error?: string;
}) {
  const [min, setMin] = useState(defaultMin);
  const [max, setMax] = useState(defaultMax);

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-body-sm font-semibold">Level</legend>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-h2" aria-live="polite">
          {min.toFixed(1)} – {max.toFixed(1)}
        </p>
        <p className="text-right text-caption text-muted">
          {levelLabel(levelFromRating(min))}
          {levelFromRating(min) !== levelFromRating(max) && ` – ${levelLabel(levelFromRating(max))}`}
        </p>
      </div>
      <div className="relative h-11">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-line" aria-hidden />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ink"
          style={{ left: `${pct(min)}%`, right: `${100 - pct(max)}%` }}
          aria-hidden
        />
        <input
          type="range"
          name="levelMin"
          aria-label="Level minimal"
          min={LEVEL_RANGE_MIN}
          max={LEVEL_RANGE_MAX}
          step={LEVEL_STEP}
          value={min}
          onChange={(e) => setMin(Math.min(Number(e.target.value), max))}
          className={thumb}
        />
        <input
          type="range"
          name="levelMax"
          aria-label="Level maksimal"
          min={LEVEL_RANGE_MIN}
          max={LEVEL_RANGE_MAX}
          step={LEVEL_STEP}
          value={max}
          onChange={(e) => setMax(Math.max(Number(e.target.value), min))}
          className={thumb}
        />
      </div>
      <div className="flex justify-between text-caption text-muted" aria-hidden>
        <span>{LEVEL_RANGE_MIN.toFixed(1)}</span>
        <span>{LEVEL_RANGE_MAX.toFixed(1)}</span>
      </div>
      <FieldError id="levelMax" error={error} />
    </fieldset>
  );
}

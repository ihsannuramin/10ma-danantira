"use client";

import { ArrowRight, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { completeOnboarding } from "@/actions/player";
import { Button, buttonClasses } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/choice";
import { Alert } from "@/components/ui/state";
import { useFormAction } from "@/components/ui/use-form-action";
import type { Area } from "@/data/reference";
import { ASSESSMENT_QUESTIONS, INITIAL_RELIABILITY, LEVEL_LABEL } from "@/domain/rating/rating.constants";
import { formatRating } from "@/domain/rating/rating.service";
import type { TennisLevel } from "@/domain/rating/rating.types";
import { cn } from "@/lib/cn";
import { IDLE, type ActionState } from "@/lib/errors";
import { BasicProfileFields, PlayingProfileFields } from "./profile-fields";

const STEPS = [
  { title: "Kenalan dulu", fields: ["displayName", "areaId", "gender", "dominantHand"] },
  { title: "Gaya main kamu", fields: ["playingStyle", "playingObjective", "preferredFormat", "availability"] },
  { title: "Tentukan level", fields: ["experience", "rally", "matchExperience"] },
] as const;

type Result = { rating: number; level: TennisLevel };

export function OnboardingForm({
  areas,
  defaultName,
  returnTo,
}: {
  areas: Area[];
  defaultName: string;
  /** Where the player was headed before onboarding (e.g. a shared mabar link). */
  returnTo: string | null;
}) {
  const [state, onSubmit, pending] = useFormAction<ActionState<Result>>(completeOnboarding, IDLE);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const errors = state.ok === false ? (state.fieldErrors ?? {}) : {};

  // When the server rejects a field, jump back to the step that owns it
  // (adjusting state during render, once per new action result).
  const [seenState, setSeenState] = useState(state);
  if (state !== seenState) {
    setSeenState(state);
    if (state.ok === false && state.fieldErrors) {
      const first = Object.keys(state.fieldErrors)[0];
      const owner = STEPS.findIndex((s) => (s.fields as readonly string[]).includes(first ?? ""));
      if (owner >= 0) setStep(owner);
    }
  }

  useEffect(() => headingRef.current?.focus(), [step]);

  if (state.ok === true) return <LevelResult result={state.data} returnTo={returnTo} />;

  function goNext() {
    const form = formRef.current!;
    if (step === 0) {
      const name = (form.elements.namedItem("displayName") as HTMLInputElement).value.trim();
      const area = (form.elements.namedItem("areaId") as HTMLSelectElement).value;
      if (name.length < 2 || !area) {
        setStepError(name.length < 2 ? "Isi nama panggilan dulu (minimal 2 karakter)." : "Pilih area main kamu.");
        return;
      }
    }
    setStepError(null);
    setStep((s) => s + 1);
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div>
        <ol className="flex gap-2" aria-label="Langkah onboarding">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              aria-current={i === step ? "step" : undefined}
              className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-ink" : "bg-line")}
            >
              <span className="sr-only">
                Langkah {i + 1}: {s.title}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-caption text-muted">
          Langkah {step + 1} dari {STEPS.length}
        </p>
        <h1 ref={headingRef} tabIndex={-1} className="text-h1 outline-none">
          {STEPS[step]!.title}
        </h1>
      </div>

      {state.ok === false && !state.fieldErrors && <Alert title={state.error.title} description={state.error.description} />}
      {stepError && <Alert title={stepError} />}

      {/* All steps stay mounted so their values submit together. */}
      <div hidden={step !== 0}>
        <BasicProfileFields areas={areas} defaults={{ displayName: defaultName }} errors={errors} />
      </div>
      <div hidden={step !== 1}>
        <PlayingProfileFields errors={errors} />
      </div>
      <div hidden={step !== 2} className="flex flex-col gap-6">
        <div className="rounded-lg bg-ink p-4 text-white">
          <p className="font-bold text-lime">Baru mulai tenis?</p>
          <p className="text-body-sm text-white/80">Santai. Kita bantu cari mabar yang cocok dengan level kamu.</p>
        </div>
        {(Object.keys(ASSESSMENT_QUESTIONS) as (keyof typeof ASSESSMENT_QUESTIONS)[]).map((key) => (
          <SegmentedControl
            key={key}
            name={key}
            legend={ASSESSMENT_QUESTIONS[key].question}
            layout="cards"
            options={Object.entries(ASSESSMENT_QUESTIONS[key].options).map(([value, label]) => ({ value, label }))}
            error={errors[key]}
          />
        ))}
      </div>

      <div className="sticky bottom-0 -mx-4 flex gap-3 border-t border-line bg-soft/95 px-4 py-4 backdrop-blur">
        {step > 0 && (
          <Button key="back" variant="secondary" onClick={() => setStep((s) => s - 1)} className="w-28">
            Kembali
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button key="next" onClick={goNext} fullWidth className="flex-1" icon={<ArrowRight className="size-5" aria-hidden />}>
            Lanjut
          </Button>
        ) : (
          <Button key="submit" type="submit" loading={pending} className="flex-1">
            Tentukan Level Saya
          </Button>
        )}
      </div>
    </form>
  );
}

function LevelResult({ result, returnTo }: { result: Result; returnTo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-lime">
        <Sparkles className="size-8" aria-hidden />
      </span>
      <div>
        <p className="text-body-sm text-muted">Level kamu</p>
        <h1 className="text-display">{LEVEL_LABEL[result.level]}</h1>
      </div>
      <div className="w-full rounded-lg border-2 border-ink bg-white p-5 shadow-brutal">
        <p className="text-caption text-muted">Rating awal</p>
        <p className="text-display">{formatRating(result.rating)}</p>
        <p className="mt-2 text-body-sm text-muted">
          Reliability {INITIAL_RELIABILITY}% — makin sering main competitive, rating kamu makin akurat.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3">
        {returnTo ? (
          <Link href={returnTo} className={buttonClasses({ fullWidth: true })}>
            Lanjut ke Mabar
            <ArrowRight className="size-5" aria-hidden />
          </Link>
        ) : (
          <Link href="/mabar" className={buttonClasses({ fullWidth: true })}>
            <Search className="size-5" aria-hidden />
            Cari Mabar
          </Link>
        )}
        <Link href="/home" className={buttonClasses({ variant: "ghost", fullWidth: true })}>
          Ke Home
        </Link>
      </div>
    </div>
  );
}

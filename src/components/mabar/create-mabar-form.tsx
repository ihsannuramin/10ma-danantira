"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createMabar } from "@/actions/mabar";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/choice";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import { useFormAction } from "@/components/ui/use-form-action";
import type { Area, Venue } from "@/data/reference";
import {
  DESCRIPTION_MAX,
  FORMAT_LABEL,
  MATCH_TYPE_LABEL,
  MAX_SESSION_PLAYERS,
  MIN_PLAYERS,
  TITLE_MAX,
} from "@/domain/mabar/mabar.constants";
import type { MabarFormat } from "@/domain/mabar/mabar.types";
import {
  DEFAULT_DEUCE_RULE,
  DEFAULT_SCORING_FORMAT,
  DEUCE_RULES,
  SCORING_FORMATS,
  SCORING_FORMAT_INFO,
} from "@/domain/match/match.constants";
import { IDLE, type ActionState } from "@/lib/errors";
import { LevelRangeSlider } from "./level-range-slider";
import { PlayerCountStepper } from "./player-count-stepper";

const DEUCE_SHORT_LABEL = { ADVANTAGE: "Advantage", NO_AD: "No-Ad", ONE_DEUCE: "1x Deuce" } as const;

const NEW_VENUE = "__new";

export function CreateMabarForm({
  venues,
  areas,
  playerAreaId,
  minDate,
  defaultLevel,
}: {
  venues: Venue[];
  areas: Area[];
  playerAreaId: string;
  minDate: string;
  defaultLevel: { min: number; max: number };
}) {
  const router = useRouter();
  const toast = useToast();
  const [state, onSubmit, pending] = useFormAction<ActionState<{ id: string }>>(createMabar, IDLE);
  const [format, setFormat] = useState<MabarFormat>("DOUBLES");
  const [players, setPlayers] = useState<number>(MIN_PLAYERS.DOUBLES);
  const [venueId, setVenueId] = useState("");
  const errors = state.ok === false ? (state.fieldErrors ?? {}) : {};

  useEffect(() => {
    if (state.ok !== true) return;
    toast("Mabar berhasil dibuat.");
    router.push(`/mabar/${state.data.id}`);
  }, [state, router, toast]);

  // Venues in the player's own area first.
  const sortedAreas = [...areas].sort((a, b) => Number(b.id === playerAreaId) - Number(a.id === playerAreaId));
  const isNewVenue = venueId === NEW_VENUE;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      {state.ok === false && <Alert title={state.error.title} description={state.error.description} />}

      <SegmentedControl
        name="format"
        legend="Format"
        value={format}
        onChange={(v) => {
          const next = v as MabarFormat;
          setFormat(next);
          // Keep the session size valid for the new format.
          setPlayers((n) => Math.max(n, MIN_PLAYERS[next]));
        }}
        options={(Object.keys(FORMAT_LABEL) as MabarFormat[]).map((f) => ({ value: f, label: FORMAT_LABEL[f] }))}
        error={errors.format}
      />

      <PlayerCountStepper
        value={players}
        min={MIN_PLAYERS[format]}
        max={MAX_SESSION_PLAYERS}
        onStep={(d) => setPlayers((n) => Math.min(MAX_SESSION_PLAYERS, Math.max(MIN_PLAYERS[format], n + d)))}
        error={errors.maxPlayers}
      />

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1.5 text-body-sm font-semibold">Tanggal & waktu</legend>
        <Field id="date" label="Tanggal" error={errors.date}>
          <Input id="date" name="date" type="date" min={minDate} required error={errors.date} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="startTime" label="Mulai" error={errors.startTime}>
            <Input id="startTime" name="startTime" type="time" step={900} defaultValue="07:00" required error={errors.startTime} />
          </Field>
          <Field id="endTime" label="Selesai" error={errors.endTime}>
            <Input id="endTime" name="endTime" type="time" step={900} defaultValue="09:00" required error={errors.endTime} />
          </Field>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <input type="hidden" name="venueMode" value={isNewVenue ? "new" : "existing"} />
        <Field id="venueId" label="Lokasi" error={errors.venueId}>
          <Select
            id="venueId"
            name="venueId"
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            required
            error={errors.venueId}
          >
            <option value="" disabled>
              Pilih venue
            </option>
            {sortedAreas.map((area) => {
              const inArea = venues.filter((v) => v.areaId === area.id);
              if (inArea.length === 0) return null;
              return (
                <optgroup key={area.id} label={area.name}>
                  {inArea.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
            <option value={NEW_VENUE}>+ Tambah venue baru</option>
          </Select>
        </Field>
        {isNewVenue && (
          <div className="grid gap-3 rounded-md border border-dashed border-line bg-white p-4 sm:grid-cols-2">
            <Field id="venueName" label="Nama venue" error={errors.venueName}>
              <Input id="venueName" name="venueName" maxLength={80} required error={errors.venueName} autoFocus />
            </Field>
            <Field id="venueAreaId" label="Area venue" error={errors.venueAreaId}>
              <Select id="venueAreaId" name="venueAreaId" defaultValue={playerAreaId} required error={errors.venueAreaId}>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        )}
      </div>

      <LevelRangeSlider defaultMin={defaultLevel.min} defaultMax={defaultLevel.max} error={errors.levelMax ?? errors.levelMin} />

      <SegmentedControl
        name="matchType"
        legend="Tipe match"
        defaultValue="CASUAL"
        options={[
          { value: "CASUAL", label: MATCH_TYPE_LABEL.CASUAL },
          { value: "COMPETITIVE", label: MATCH_TYPE_LABEL.COMPETITIVE },
        ]}
        error={errors.matchType}
      />
      <p className="-mt-4 text-caption text-muted">Hanya hasil match Competitive yang mengubah rating.</p>

      <SegmentedControl
        name="scoringFormat"
        legend="Format skor"
        layout="cards"
        defaultValue={DEFAULT_SCORING_FORMAT}
        options={SCORING_FORMATS.map((f) => ({
          value: f,
          label: SCORING_FORMAT_INFO[f].label,
          description: SCORING_FORMAT_INFO[f].description,
        }))}
        error={errors.scoringFormat}
      />

      <SegmentedControl
        name="deuceRule"
        legend="Aturan deuce"
        defaultValue={DEFAULT_DEUCE_RULE}
        options={DEUCE_RULES.map((r) => ({ value: r, label: DEUCE_SHORT_LABEL[r] }))}
        error={errors.deuceRule}
      />

      <Field id="cost" label="Biaya per player" optional error={errors.cost}>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body font-semibold text-muted">Rp</span>
          <Input id="cost" name="cost" inputMode="numeric" placeholder="75.000" className="pl-11" error={errors.cost} />
        </div>
      </Field>

      <Field id="title" label="Nama mabar" optional hint="Kosongkan untuk pakai nama area, mis. “Tennis Mabar — Kemang”." error={errors.title}>
        <Input id="title" name="title" maxLength={TITLE_MAX} error={errors.title} hint="Kosongkan untuk pakai nama area." />
      </Field>

      <Field id="description" label="Deskripsi" optional error={errors.description}>
        <Textarea
          id="description"
          name="description"
          maxLength={DESCRIPTION_MAX}
          placeholder="Mis. bawa bola sendiri, parkir di basement."
          error={errors.description}
        />
      </Field>

      <div className="sticky bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] -mx-4 -mb-8 border-t border-line bg-soft/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:bottom-0 lg:mb-0">
        {/* Stays busy after success while we navigate to the new mabar. */}
        <Button type="submit" fullWidth loading={pending || state.ok === true}>
          Create Mabar
        </Button>
      </div>
    </form>
  );
}

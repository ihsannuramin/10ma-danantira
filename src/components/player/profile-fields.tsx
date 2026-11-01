import { CheckboxChips, SegmentedControl } from "@/components/ui/choice";
import { Field, Input, Select } from "@/components/ui/field";
import type { Area } from "@/data/reference";
import {
  AVAILABILITY_LABEL,
  DOMINANT_HAND_LABEL,
  GENDER_LABEL,
  PLAYING_OBJECTIVE_LABEL,
  PLAYING_STYLE_LABEL,
  PREFERRED_FORMAT_LABEL,
  type AvailabilitySlot,
  type DominantHand,
  type Gender,
  type PlayingObjective,
  type PlayingStyle,
  type PreferredFormat,
} from "@/domain/player/player.constants";

export type ProfileDefaults = {
  displayName?: string;
  areaId?: string;
  gender?: Gender | null;
  dominantHand?: DominantHand | null;
  playingStyle?: PlayingStyle;
  playingObjective?: PlayingObjective;
  preferredFormat?: PreferredFormat;
  availability?: AvailabilitySlot[];
};

const options = (labels: Record<string, string>) => Object.entries(labels).map(([value, label]) => ({ value, label }));

export function BasicProfileFields({
  areas,
  defaults = {},
  errors = {},
}: {
  areas: Area[];
  defaults?: ProfileDefaults;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field id="displayName" label="Nama panggilan" error={errors.displayName}>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaults.displayName}
          autoComplete="nickname"
          maxLength={40}
          required
          error={errors.displayName}
        />
      </Field>
      <Field id="areaId" label="Area main" hint="Dipakai untuk mencarikan mabar terdekat." error={errors.areaId}>
        <Select id="areaId" name="areaId" defaultValue={defaults.areaId ?? ""} required error={errors.areaId} hint="Dipakai untuk mencarikan mabar terdekat.">
          <option value="" disabled>
            Pilih area
          </option>
          {areas.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <SegmentedControl
          name="gender"
          legend={<>Gender <span className="font-normal text-muted">(opsional)</span></>}
          options={options(GENDER_LABEL)}
          defaultValue={defaults.gender ?? undefined}
          error={errors.gender}
        />
        <SegmentedControl
          name="dominantHand"
          legend={<>Tangan dominan <span className="font-normal text-muted">(opsional)</span></>}
          options={options(DOMINANT_HAND_LABEL)}
          defaultValue={defaults.dominantHand ?? undefined}
          error={errors.dominantHand}
        />
      </div>
    </div>
  );
}

export function PlayingProfileFields({
  defaults = {},
  errors = {},
}: {
  defaults?: ProfileDefaults;
  errors?: Record<string, string>;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field id="playingStyle" label="Gaya main" error={errors.playingStyle}>
        <Select id="playingStyle" name="playingStyle" defaultValue={defaults.playingStyle ?? "STILL_LEARNING"} error={errors.playingStyle}>
          {options(PLAYING_STYLE_LABEL).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field id="playingObjective" label="Tujuan main" error={errors.playingObjective}>
        <Select id="playingObjective" name="playingObjective" defaultValue={defaults.playingObjective ?? "FUN"} error={errors.playingObjective}>
          {options(PLAYING_OBJECTIVE_LABEL).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Field>
      <SegmentedControl
        name="preferredFormat"
        legend="Format favorit"
        options={options(PREFERRED_FORMAT_LABEL)}
        defaultValue={defaults.preferredFormat ?? "BOTH"}
        error={errors.preferredFormat}
      />
      <CheckboxChips
        name="availability"
        legend="Biasanya bisa main kapan?"
        options={options(AVAILABILITY_LABEL)}
        defaultValues={defaults.availability}
        error={errors.availability}
      />
    </div>
  );
}

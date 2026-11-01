"use client";

import { updateProfile } from "@/actions/player";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";
import { useFormAction } from "@/components/ui/use-form-action";
import type { Area } from "@/data/reference";
import { IDLE, type ActionState } from "@/lib/errors";
import { BasicProfileFields, PlayingProfileFields, type ProfileDefaults } from "./profile-fields";

export function EditProfileForm({ areas, defaults }: { areas: Area[]; defaults: ProfileDefaults }) {
  const [state, onSubmit, pending] = useFormAction<ActionState>(updateProfile, IDLE);
  const errors = state.ok === false ? (state.fieldErrors ?? {}) : {};

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8" noValidate>
      {state.ok === false && <Alert title={state.error.title} description={state.error.description} />}
      <BasicProfileFields areas={areas} defaults={defaults} errors={errors} />
      <PlayingProfileFields defaults={defaults} errors={errors} />
      <p className="text-caption text-muted">
        Rating tidak bisa diubah manual. Rating berubah otomatis dari hasil match Competitive yang sudah dikonfirmasi.
      </p>
      <div className="sticky bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] -mx-4 -mb-8 border-t border-line bg-soft/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:bottom-0 lg:mb-0">
        <Button type="submit" fullWidth loading={pending}>
          Simpan
        </Button>
      </div>
    </form>
  );
}

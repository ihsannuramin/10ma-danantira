"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { cancelMabar, joinMabar, leaveMabar } from "@/actions/mabar";
import { Button, buttonClasses } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import type { JoinErrorCode, MabarStatus } from "@/domain/mabar/mabar.types";
import type { ShareableMabar } from "@/domain/share/whatsapp";
import { userError, type ActionResult, type UserError } from "@/lib/errors";
import { ShareButton } from "./share-button";

type Props = {
  mabarId: string;
  status: MabarStatus;
  isOrganizer: boolean;
  isParticipant: boolean;
  /** Result of canJoin for this viewer; null when they can join. */
  joinBlockedBy: JoinErrorCode | null;
  share: ShareableMabar;
};

/**
 * Sticky bottom action bar for Match Detail. Join is shown optimistically
 * (safe: the server re-checks and we roll back on failure); leave and cancel
 * wait for the server and ask for confirmation first.
 */
export function JoinPanel({ mabarId, status, isOrganizer, isParticipant, joinBlockedBy, share }: Props) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [joined, setOptimisticJoined] = useOptimistic(isParticipant);
  const [error, setError] = useState<UserError | null>(null);
  const [confirm, setConfirm] = useState<"leave" | "cancel" | null>(null);

  const beforeStart = status === "OPEN" || status === "FULL";

  function run(action: () => Promise<ActionResult>, success: string, optimistic?: boolean) {
    setError(null);
    startTransition(async () => {
      if (optimistic !== undefined) setOptimisticJoined(optimistic);
      const result = await action();
      setConfirm(null);
      if (result.ok) toast(success);
      else setError(result.error);
    });
  }

  let primary: React.ReactNode;
  if ((joined || isOrganizer) && status === "LIVE") {
    // The player is on court; score entry and results arrive with live scoring.
    primary = (
      <div className="flex w-full flex-col">
        <p className="flex items-center gap-2 text-body-sm font-bold">
          <span className="size-2 animate-pulse rounded-full bg-danger" aria-hidden />
          Match sedang berlangsung
        </p>
        <p className="text-caption text-muted">
          {isOrganizer ? "Mulai match dan input skor di bagian Matches." : "Semangat mainnya!"}
        </p>
      </div>
    );
  } else if (isOrganizer && beforeStart) {
    primary = (
      <Button variant="danger" fullWidth onClick={() => setConfirm("cancel")}>
        Batalkan Mabar
      </Button>
    );
  } else if (joined && beforeStart) {
    primary = (
      <div className="flex w-full items-center gap-2">
        <p className="flex flex-1 items-center gap-2 whitespace-nowrap text-body-sm font-semibold">
          <CircleCheck className="size-5 text-green-700" aria-hidden />
          Sudah join
        </p>
        <Button variant="ghost" size="sm" onClick={() => setConfirm("leave")} disabled={pending}>
          Keluar
        </Button>
      </div>
    );
  } else if (!joinBlockedBy) {
    primary = (
      <Button fullWidth loading={pending} onClick={() => run(() => joinMabar(mabarId), "Kamu sudah join! Sampai ketemu di lapangan.", true)}>
        Join This Match
      </Button>
    );
  } else {
    const reason = userError(joinBlockedBy);
    primary = (
      <div className="flex w-full flex-col gap-1">
        <p className="text-body-sm font-semibold">{reason.title}</p>
        <Link href="/mabar" className="inline-flex min-h-11 items-center self-start text-body-sm font-bold underline underline-offset-4">
          Cari Mabar Lain
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="sticky bottom-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] -mx-4 -mb-8 flex flex-col gap-3 border-t border-line bg-white px-4 py-4 md:-mx-6 md:px-6 lg:bottom-0 lg:mx-0 lg:mb-0 lg:rounded-lg lg:border">
        {error && (
          <div className="flex flex-col gap-2">
            <Alert title={error.title} description={error.description} />
            {(error.code === "MABAR_FULL" || error.code === "MABAR_STARTED" || error.code === "MABAR_CANCELLED") && (
              <Link href="/mabar" className={buttonClasses({ variant: "secondary", size: "sm" })}>
                Cari Mabar Lain
              </Link>
            )}
          </div>
        )}
        <div className="flex items-center gap-3">
          <div className="flex min-w-0 flex-1">{primary}</div>
          <ShareButton mabarId={mabarId} mabar={share} variant={joinBlockedBy && !joined && !isOrganizer ? "primary" : "secondary"} />
        </div>
      </div>

      <Modal
        open={confirm === "leave"}
        onClose={() => setConfirm(null)}
        title="Keluar dari mabar ini?"
        description="Slot kamu akan dibuka untuk player lain."
      >
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setConfirm(null)}>
            Batal
          </Button>
          <Button variant="danger" fullWidth loading={pending} onClick={() => run(() => leaveMabar(mabarId), "Kamu sudah keluar dari mabar.", false)}>
            Keluar
          </Button>
        </div>
      </Modal>

      <Modal
        open={confirm === "cancel"}
        onClose={() => setConfirm(null)}
        title="Batalkan mabar ini?"
        description="Semua player akan melihat mabar ini dibatalkan. Ini tidak bisa diurungkan."
      >
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setConfirm(null)}>
            Jangan
          </Button>
          <Button variant="danger" fullWidth loading={pending} onClick={() => run(() => cancelMabar(mabarId), "Mabar dibatalkan.")}>
            Batalkan
          </Button>
        </div>
      </Modal>
    </>
  );
}

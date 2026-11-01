"use client";

import { RotateCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cancelMatch } from "@/actions/match";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import type { UserError } from "@/lib/errors";

/** Pull fresh score for spectators; no polling (master-prompt §41). */
export function RefreshButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button variant="secondary" size="sm" loading={pending} onClick={() => startTransition(() => router.refresh())} icon={<RotateCw className="size-4" aria-hidden />}>
      Muat ulang skor
    </Button>
  );
}

export function CancelMatchButton({ matchId, mabarId }: { matchId: string; mabarId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<UserError | null>(null);
  const [pending, startTransition] = useTransition();

  function cancel() {
    startTransition(async () => {
      const result = await cancelMatch(matchId);
      if (!result.ok) return setError(result.error);
      setOpen(false);
      toast("Match dibatalkan.");
      router.push(`/mabar/${mabarId}`);
    });
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} icon={<X className="size-4" aria-hidden />}>
        Batalkan match
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Batalkan match ini?" description="Skor match ini dibuang dan tidak masuk riwayat.">
        <div className="flex flex-col gap-3">
          {error && <Alert title={error.title} description={error.description} />}
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
              Jangan
            </Button>
            <Button variant="danger" fullWidth loading={pending} onClick={cancel}>
              Batalkan
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

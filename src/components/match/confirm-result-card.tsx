"use client";

import { useState, useTransition } from "react";
import { confirmMatchResult, rejectMatchResult } from "@/actions/match";
import { Button } from "@/components/ui/button";
import { Field, Textarea } from "@/components/ui/field";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import type { UserError } from "@/lib/errors";

/** Shown to a player who can confirm a pending competitive result. */
export function ConfirmResultCard({ matchId, hoursLeft }: { matchId: string; hoursLeft: number }) {
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<UserError | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  function run(action: () => ReturnType<typeof confirmMatchResult>, success: string) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setRejecting(false);
        toast(success);
      } else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border-2 border-ink bg-lime p-4 shadow-brutal">
      <div>
        <p className="text-h3">Konfirmasi hasil match</p>
        <p className="text-body-sm">
          Skornya sudah benar? Kalau tidak dijawab, hasil otomatis official dalam {hoursLeft} jam.
        </p>
      </div>
      {error && <Alert title={error.title} description={error.description} />}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setRejecting(true)} disabled={pending} className="flex-1">
          Tolak
        </Button>
        <Button variant="dark" onClick={() => run(() => confirmMatchResult(matchId), "Hasil dikonfirmasi.")} loading={pending} className="flex-2">
          Konfirmasi
        </Button>
      </div>

      <Modal open={rejecting} onClose={() => setRejecting(false)} title="Tolak hasil ini?" description="Organizer akan memperbaiki skor lalu mengirim ulang.">
        <div className="flex flex-col gap-4">
          <Field id="reject-reason" label="Apa yang salah?" optional>
            <Textarea
              id="reject-reason"
              value={reason}
              maxLength={200}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Mis. set 2 harusnya 6-4 untuk Team B."
            />
          </Field>
          <Button variant="danger" fullWidth loading={pending} onClick={() => run(() => rejectMatchResult(matchId, reason), "Hasil ditolak. Organizer akan memperbaikinya.")}>
            Tolak Hasil
          </Button>
        </div>
      </Modal>
    </div>
  );
}

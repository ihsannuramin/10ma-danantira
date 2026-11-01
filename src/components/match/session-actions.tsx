"use client";

import { Flag, Play } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { endMabar } from "@/actions/match";
import { Button, buttonClasses } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Alert } from "@/components/ui/state";
import { useToast } from "@/components/ui/toast";
import type { MabarFormat } from "@/domain/mabar/mabar.types";
import type { UserError } from "@/lib/errors";
import { TeamPicker, type PickablePlayer } from "./team-picker";

/** Organizer controls for a LIVE session: start the next match or end the session. */
export function SessionActions({
  mabarId,
  format,
  players,
  liveMatchId,
}: {
  mabarId: string;
  format: MabarFormat;
  players: PickablePlayer[];
  liveMatchId: string | null;
}) {
  const toast = useToast();
  const [picking, setPicking] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<UserError | null>(null);
  const [pending, startTransition] = useTransition();

  function end() {
    setError(null);
    startTransition(async () => {
      const result = await endMabar(mabarId);
      setEnding(false);
      if (result.ok) toast("Mabar selesai. Sampai main lagi!");
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert title={error.title} description={error.description} />}
      <div className="flex gap-3">
        {liveMatchId ? (
          <Link href={`/mabar/${mabarId}/match/${liveMatchId}`} className={buttonClasses({ className: "flex-2" })}>
            <Play className="size-5" aria-hidden />
            Lanjut Input Skor
          </Link>
        ) : (
          <Button onClick={() => setPicking(true)} className="flex-2" icon={<Play className="size-5" aria-hidden />}>
            Mulai Match
          </Button>
        )}
        <Button variant="secondary" onClick={() => setEnding(true)} className="flex-1" icon={<Flag className="size-5" aria-hidden />}>
          Selesai
        </Button>
      </div>

      <TeamPicker open={picking} onClose={() => setPicking(false)} mabarId={mabarId} format={format} players={players} />
      <Modal
        open={ending}
        onClose={() => setEnding(false)}
        title="Selesaikan mabar?"
        description="Tidak bisa mulai match baru lagi. Hasil yang masih menunggu konfirmasi tetap bisa dikonfirmasi."
      >
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={() => setEnding(false)}>
            Belum
          </Button>
          <Button variant="dark" fullWidth loading={pending} onClick={end}>
            Selesaikan
          </Button>
        </div>
      </Modal>
    </div>
  );
}

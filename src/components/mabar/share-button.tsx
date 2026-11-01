"use client";

import { Share2 } from "lucide-react";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { buildMabarShareText, whatsappShareUrl, type ShareableMabar } from "@/domain/share/whatsapp";

/**
 * Uses the OS share sheet where available (WhatsApp is one tap away) and
 * falls back to a wa.me deep link. No WhatsApp API involved.
 */
export function ShareButton({ mabarId, mabar, variant = "secondary" }: { mabarId: string; mabar: ShareableMabar; variant?: ButtonVariant }) {
  async function share() {
    const text = buildMabarShareText(mabar, `${window.location.origin}/mabar/${mabarId}`);
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }
    window.open(whatsappShareUrl(text), "_blank", "noopener,noreferrer");
  }

  return (
    <Button variant={variant} onClick={share} icon={<Share2 className="size-5" aria-hidden />}>
      Share
    </Button>
  );
}

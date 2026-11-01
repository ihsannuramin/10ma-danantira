import { FORMAT_LABEL } from "@/domain/mabar/mabar.constants";
import type { MabarFormat } from "@/domain/mabar/mabar.types";
import { formatLevelRange, formatRupiah, formatShortDate, formatTimeRange } from "@/lib/format";

export type ShareableMabar = {
  title: string;
  startsAt: Date;
  endsAt: Date;
  venueName: string;
  levelMin: number;
  levelMax: number;
  format: MabarFormat;
  participantCount: number;
  maxPlayers: number;
  costPerPlayer: number | null;
};

export function buildMabarShareText(mabar: ShareableMabar, joinUrl: string): string {
  const lines = [
    `🎾 ${mabar.title}`,
    "",
    `📅 ${formatShortDate(mabar.startsAt)}`,
    `🕖 ${formatTimeRange(mabar.startsAt, mabar.endsAt)}`,
    `📍 ${mabar.venueName}`,
    "",
    `⭐ Level: ${formatLevelRange(mabar.levelMin, mabar.levelMax)}`,
    `🎾 ${FORMAT_LABEL[mabar.format]}`,
    `👥 ${mabar.participantCount}/${mabar.maxPlayers} players`,
  ];
  if (mabar.costPerPlayer !== null) {
    lines.push("", `💰 ${formatRupiah(mabar.costPerPlayer)}/player`);
  }
  lines.push("", "Join Mabar:", joinUrl);
  return lines.join("\n");
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

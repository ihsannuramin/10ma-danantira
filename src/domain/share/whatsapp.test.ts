import { describe, expect, it } from "vitest";
import { buildMabarShareText, whatsappShareUrl, type ShareableMabar } from "./whatsapp";

const mabar: ShareableMabar = {
  title: "Tennis Mabar — Kemang",
  startsAt: new Date("2025-11-08T00:00:00Z"),
  endsAt: new Date("2025-11-08T02:00:00Z"),
  venueName: "Kemang Tennis Club",
  levelMin: 2.5,
  levelMax: 3.5,
  format: "DOUBLES",
  participantCount: 3,
  maxPlayers: 4,
  costPerPlayer: 75000,
};

describe("buildMabarShareText", () => {
  it("includes every field from the PRD template in WIB", () => {
    const text = buildMabarShareText(mabar, "https://tenma.app/mabar/abc");
    expect(text).toBe(
      [
        "🎾 Tennis Mabar — Kemang",
        "",
        "📅 Sab, 8 Nov",
        "🕖 07:00–09:00",
        "📍 Kemang Tennis Club",
        "",
        "⭐ Level: 2.5 – 3.5",
        "🎾 Doubles",
        "👥 3/4 players",
        "",
        "💰 Rp75.000/player",
        "",
        "Join Mabar:",
        "https://tenma.app/mabar/abc",
      ].join("\n"),
    );
  });

  it("omits the cost line when no cost is set", () => {
    expect(buildMabarShareText({ ...mabar, costPerPlayer: null }, "x")).not.toContain("💰");
  });
});

describe("whatsappShareUrl", () => {
  it("encodes the text into a wa.me link", () => {
    expect(whatsappShareUrl("a b\n&")).toBe("https://wa.me/?text=a%20b%0A%26");
  });
});

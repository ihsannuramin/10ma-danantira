import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { MabarStatus } from "@/domain/mabar/mabar.types";
import { isRatingInRange } from "@/domain/rating/rating.service";

type Viewer = { rating: number; joined?: boolean };

/**
 * One mapping from status to label for every screen. An open mabar reads
 * "Joinable" only when this viewer could actually join it.
 */
export function statusBadge(
  status: MabarStatus,
  levelMin: number,
  levelMax: number,
  viewer: Viewer,
): { tone: BadgeTone; label: string } {
  switch (status) {
    case "OPEN":
      if (viewer.joined) return { tone: "lime", label: "Joined" };
      return isRatingInRange(viewer.rating, levelMin, levelMax)
        ? { tone: "success", label: "Joinable" }
        : { tone: "info", label: "Open" };
    case "FULL":
      return viewer.joined ? { tone: "lime", label: "Joined · Full" } : { tone: "neutral", label: "Full" };
    case "UPCOMING":
      return { tone: "info", label: "Upcoming" };
    case "LIVE":
      return { tone: "live", label: "LIVE" };
    case "COMPLETED":
      return { tone: "dark", label: "Completed" };
    case "CANCELLED":
      return { tone: "danger", label: "Cancelled" };
    case "EXPIRED":
      return { tone: "neutral", label: "Expired" };
  }
}

export function MabarStatusBadge(props: { status: MabarStatus; levelMin: number; levelMax: number; viewer: Viewer }) {
  const { tone, label } = statusBadge(props.status, props.levelMin, props.levelMax, props.viewer);
  return (
    <Badge tone={tone} dot={tone === "success" || tone === "live"}>
      {label}
    </Badge>
  );
}

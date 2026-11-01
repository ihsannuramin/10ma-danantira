import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "info" | "neutral" | "danger" | "warning" | "live" | "lime" | "dark";

// Text colours are darkened from the semantic palette so badges stay
// readable (WCAG AA) on their tinted backgrounds.
const TONES: Record<BadgeTone, string> = {
  success: "bg-success/12 text-green-800",
  info: "bg-info/10 text-blue-800",
  neutral: "bg-soft text-muted border border-line",
  danger: "bg-danger/10 text-red-800",
  warning: "bg-warning/15 text-amber-900",
  live: "bg-danger text-white",
  lime: "bg-lime text-ink",
  dark: "bg-ink text-white",
};

/** Status label. Always carries text, so colour is never the only signal. */
export function Badge({ tone = "neutral", children, className, dot = false }: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-caption font-semibold whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full bg-current", tone === "live" && "animate-pulse")} aria-hidden />}
      {children}
    </span>
  );
}

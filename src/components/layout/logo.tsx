import { cn } from "@/lib/cn";

/** Tennis-ball mark: lime disc, ink ring and seam. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden>
      <circle cx="24" cy="24" r="21" fill="#D9FF00" stroke="#111" strokeWidth="4" />
      <path d="M14 34c6-4 8-12 6-20M34 14c-6 4-8 12-6 20" fill="none" stroke="#111" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className={cn("text-[1.05rem] leading-[0.95] font-extrabold italic tracking-tight", inverted ? "text-white" : "text-ink")}>
        Tennis
        <br />
        Mabar
      </span>
      <span className="sr-only">Tennis Mabar</span>
    </span>
  );
}

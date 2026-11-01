import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Border-first surface (Design.md §8: shadows are the exception). */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-line bg-white", className)} {...props} />;
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink/[0.07]", className)} aria-hidden />;
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-h3">{title}</h2>
      {action}
    </div>
  );
}

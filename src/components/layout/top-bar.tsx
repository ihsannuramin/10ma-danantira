import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

/** Screen header with an optional back link, as on the showcase sub-pages. */
export function TopBar({ title, backHref, actions }: { title: string; backHref?: string; actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-4 flex h-14 items-center gap-1 border-b border-line bg-white/95 px-2 backdrop-blur md:-mx-6 lg:static lg:mx-0 lg:border-none lg:bg-transparent lg:px-0">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Kembali"
          className="inline-flex size-11 items-center justify-center rounded-full hover:bg-ink/5"
        >
          <ChevronLeft className="size-6" aria-hidden />
        </Link>
      )}
      <h1 className={backHref ? "flex-1 text-h3" : "flex-1 px-2 text-h2 lg:px-0 lg:text-h1"}>{title}</h1>
      {actions}
    </header>
  );
}

/** Standard page column: 16/24/32px gutters, mobile-like width even on desktop. */
export function Page({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full ${wide ? "max-w-5xl" : "max-w-2xl"} px-4 pb-8 md:px-6 lg:px-8 lg:pt-6`}>{children}</div>
  );
}

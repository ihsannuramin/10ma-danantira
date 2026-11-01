"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Logo } from "./logo";
import { NAV_ITEMS, isActive } from "./nav-items";

/** Mobile bottom tab bar. Hidden on large screens, where the sidebar takes over. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white lg:hidden"
    >
      <ul className="mx-auto grid h-[var(--bottom-nav-h)] max-w-xl grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-0.5 text-caption"
              >
                <span
                  className={cn(
                    "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    active ? "bg-lime text-ink" : "text-muted",
                  )}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.5 : 2} aria-hidden />
                </span>
                <span className={cn(active ? "font-bold text-ink" : "text-muted")}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi utama" className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-8 px-4 py-8 lg:flex">
      <Link href="/home" className="px-3">
        <Logo />
      </Link>
      <ul className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-md px-3 text-body font-semibold transition-colors",
                  active ? "bg-lime text-ink" : "text-muted hover:bg-white hover:text-ink",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

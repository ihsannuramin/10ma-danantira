"use client";

import { Check, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import type { Area } from "@/data/reference";
import { DATE_FILTERS, FORMAT_LABEL, MATCH_TYPE_LABEL, TIME_SLOTS } from "@/domain/mabar/mabar.constants";
import { LEVEL_LABEL } from "@/domain/rating/rating.constants";
import { cn } from "@/lib/cn";

const chip =
  "inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-body-sm font-semibold transition-colors";
type Option = { value: string; label: string };
const toOptions = (labels: Record<string, string>): Option[] => Object.entries(labels).map(([value, label]) => ({ value, label }));

const chipState = (active: boolean) => (active ? "border-ink bg-lime text-ink" : "border-line bg-white text-ink hover:border-ink/40");

// Each filterSelect pill is a native <select> dressed as a pill: accessible, and it
// opens the OS picker on mobile.

/**
 * Filters live in the URL so results are server-rendered, shareable and
 * survive refresh. Every change drops the pagination cursor.
 */
export function FilterBar({ areas }: { areas: Area[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("cursor");
    startTransition(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  function filterSelect(label: string, param: string, options: Option[]) {
    const value = params.get(param);
    const selected = options.find((o) => o.value === value);
    return (
      <label
        key={param}
        className={cn(chip, chipState(Boolean(selected)), "relative cursor-pointer pr-9 focus-within:outline-2 focus-within:outline-ink")}
      >
        <span className="sr-only">Filter {label}</span>
        <select
          value={selected ? value! : ""}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setParam(param, e.target.value || null)}
          className="absolute inset-0 cursor-pointer appearance-none opacity-0"
        >
          <option value="">Semua {label.toLowerCase()}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span aria-hidden>{selected?.label ?? label}</span>
        <svg className="pointer-events-none absolute right-3 size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </label>
    );
  }

  const activeCount = ["area", "date", "time", "level", "format", "type", "q"].filter((k) => params.get(k)).length;

  return (
    <div className="flex flex-col gap-3" aria-busy={pending}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          const q = new FormData(e.currentTarget).get("q")?.toString().trim();
          setParam("q", q || null);
        }}
      >
        <label htmlFor="mabar-search" className="sr-only">
          Cari mabar, venue, atau area
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="mabar-search"
            name="q"
            type="search"
            defaultValue={params.get("q") ?? ""}
            placeholder="Cari mabar, venue, atau area…"
            className="h-12 w-full rounded-full border border-line bg-white pl-12 pr-4 text-body focus:border-ink focus:outline-none"
          />
        </div>
      </form>

      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {filterSelect("Lokasi", "area", areas.map((a) => ({ value: a.id, label: a.name })))}
        {filterSelect("Tanggal", "date", toOptions(DATE_FILTERS))}
        {filterSelect("Waktu", "time", Object.entries(TIME_SLOTS).map(([value, slot]) => ({ value, label: slot.label })))}
        {filterSelect("Level", "level", toOptions(LEVEL_LABEL))}
        {(Object.keys(FORMAT_LABEL) as (keyof typeof FORMAT_LABEL)[]).map((f) => (
          <ToggleChip key={f} active={params.get("format") === f} onClick={() => setParam("format", params.get("format") === f ? null : f)}>
            {FORMAT_LABEL[f]}
          </ToggleChip>
        ))}
        {(Object.keys(MATCH_TYPE_LABEL) as (keyof typeof MATCH_TYPE_LABEL)[]).map((t) => (
          <ToggleChip key={t} active={params.get("type") === t} onClick={() => setParam("type", params.get("type") === t ? null : t)}>
            {MATCH_TYPE_LABEL[t]}
          </ToggleChip>
        ))}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => startTransition(() => router.replace(pathname, { scroll: false }))}
            className={cn(chip, "border-transparent text-muted hover:text-ink")}
          >
            <X className="size-4" aria-hidden />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} className={cn(chip, chipState(active))}>
      {active && <Check className="size-4" aria-hidden />}
      {children}
    </button>
  );
}

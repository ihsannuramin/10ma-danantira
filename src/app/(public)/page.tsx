import { CalendarDays, ChartColumn, Users } from "lucide-react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { LogoMark } from "@/components/layout/logo";

const PILLARS = [
  { icon: Users, title: "Find Mabar", text: "Cari sesi yang pas dengan level, jadwal, dan lokasi kamu." },
  { icon: CalendarDays, title: "Play", text: "Buat atau join mabar, share ke grup WhatsApp dalam sekali tap." },
  { icon: ChartColumn, title: "Improve", text: "Catat hasil match dan lihat rating kamu bergerak." },
];

export default function LandingPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-ink text-white">
      {/* Court lines as a quiet backdrop; the hero photo lands with real assets. */}
      <svg className="pointer-events-none absolute inset-0 size-full opacity-[0.08]" viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <g fill="none" stroke="#D9FF00" strokeWidth="3">
          <rect x="40" y="60" width="320" height="680" />
          <rect x="80" y="60" width="240" height="680" />
          <line x1="40" y1="400" x2="360" y2="400" />
          <line x1="80" y1="230" x2="320" y2="230" />
          <line x1="80" y1="570" x2="320" y2="570" />
          <line x1="200" y1="230" x2="200" y2="570" />
        </g>
      </svg>
      <div className="pointer-events-none absolute -right-24 top-24 size-80 rounded-full bg-lime/25 blur-3xl" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-16 md:max-w-5xl md:flex-row md:items-center md:gap-16">
        <div className="flex flex-1 flex-col justify-center">
          <div className="flex items-center gap-4">
            <LogoMark className="size-20" />
            <h1 className="text-[3.25rem] leading-[0.9] font-extrabold italic tracking-tight">
              Tennis
              <br />
              Mabar
            </h1>
          </div>
          <p className="mt-6 text-h3 font-semibold text-lime">Find. Play. Improve.</p>
          <p className="mt-3 max-w-sm text-body text-white/75">
            Temukan teman main yang cocok, ikut atau buat mabar, dan lihat perkembangan tenis kamu.
          </p>

          <ul className="mt-10 hidden flex-col gap-4 md:flex">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-lime text-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-body-sm text-white/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-10 md:mt-0 md:w-80 md:pt-0">
          <Link href="/register" className={buttonClasses({ fullWidth: true, className: "shadow-[3px_3px_0_0_#fff]" })}>
            Get Started
          </Link>
          <Link
            href="/login"
            className={buttonClasses({ variant: "ghost", fullWidth: true, className: "border border-white/40 text-white hover:bg-white/10" })}
          >
            Login
          </Link>
          <p className="mt-2 text-center text-caption text-white/60">Main tenis jadi lebih seru.</p>
        </div>
      </div>
    </main>
  );
}

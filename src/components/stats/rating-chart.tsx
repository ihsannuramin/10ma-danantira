import type { RatingPoint } from "@/data/match";
import { APP_TIME_ZONE } from "@/domain/mabar/mabar.constants";

const W = 320;
const H = 140;
const PAD = { top: 12, right: 12, bottom: 22, left: 30 };

const monthFmt = new Intl.DateTimeFormat("id-ID", { timeZone: APP_TIME_ZONE, month: "short" });

/** Simple line chart (Design.md §23: no unnecessary visual complexity), plain SVG. */
export function RatingChart({ points }: { points: RatingPoint[] }) {
  const ratings = points.map((p) => p.rating);
  const lo = Math.floor((Math.min(...ratings) - 0.1) * 2) / 2;
  const hi = Math.ceil((Math.max(...ratings) + 0.1) * 2) / 2;
  const x = (i: number) => PAD.left + (points.length === 1 ? 0 : (i / (points.length - 1)) * (W - PAD.left - PAD.right));
  const y = (r: number) => PAD.top + (1 - (r - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);
  const ticks = [lo, (lo + hi) / 2, hi];
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.rating).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points.length - 1).toFixed(1)},${H - PAD.bottom} L${x(0).toFixed(1)},${H - PAD.bottom} Z`;
  const first = points[0]!;
  const last = points.at(-1)!;

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Grafik rating dari ${first.rating.toFixed(2)} ke ${last.rating.toFixed(2)}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="#E5E5E5" strokeWidth="1" />
            <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" fontSize="9" fill="#5F5F5F">
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        <path d={area} fill="#D9FF00" opacity="0.35" />
        <path d={path} fill="none" stroke="#111111" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p.rating)} r={i === points.length - 1 ? 4 : 2.5} fill={i === points.length - 1 ? "#D9FF00" : "#111111"} stroke="#111111" strokeWidth="1.5" />
        ))}
        <text x={PAD.left} y={H - 6} fontSize="9" fill="#5F5F5F">
          {monthFmt.format(first.at)}
        </text>
        <text x={W - PAD.right} y={H - 6} fontSize="9" fill="#5F5F5F" textAnchor="end">
          {monthFmt.format(last.at)}
        </text>
      </svg>
    </figure>
  );
}

import { cn } from "@/lib/cn";

/** Compact W/L indicators, oldest → newest. Letters carry the meaning, not just colour. */
export function RecentForm({ form }: { form: ("W" | "L")[] }) {
  return (
    <ol className="flex flex-wrap gap-1.5" aria-label={`Form terakhir: ${form.map((f) => (f === "W" ? "menang" : "kalah")).join(", ")}`}>
      {form.map((f, i) => (
        <li
          key={i}
          aria-hidden
          className={cn(
            "flex size-8 items-center justify-center rounded-full text-caption font-bold",
            f === "W" ? "bg-success text-white" : "bg-danger text-white",
          )}
        >
          {f}
        </li>
      ))}
    </ol>
  );
}

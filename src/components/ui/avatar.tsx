import Image from "next/image";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const SIZES = { sm: "size-9 text-caption", md: "size-11 text-body-sm", lg: "size-20 text-h2", xl: "size-24 text-h1" } as const;
const PX = { sm: 36, md: 44, lg: 80, xl: 96 } as const;

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink font-bold text-lime ring-2 ring-white",
        SIZES[size],
        className,
      )}
    >
      {src ? (
        <Image src={src} alt="" width={PX[size]} height={PX[size]} className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials(name)}</span>
      )}
      <span className="sr-only">{name}</span>
    </span>
  );
}

/** Overlapping avatars plus one dashed placeholder per open slot. */
export function AvatarGroup({
  people,
  openSlots = 0,
  size = "md",
}: {
  people: { name: string; src?: string | null }[];
  openSlots?: number;
  size?: "sm" | "md";
}) {
  return (
    <div className="flex items-center -space-x-2">
      {people.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} src={p.src} size={size} />
      ))}
      {Array.from({ length: openSlots }, (_, i) => (
        <span
          key={`slot-${i}`}
          className={cn(
            "inline-flex items-center justify-center rounded-full border-2 border-dashed border-line bg-white text-muted",
            SIZES[size],
          )}
          aria-hidden
        >
          <Plus className="size-4" />
        </span>
      ))}
    </div>
  );
}

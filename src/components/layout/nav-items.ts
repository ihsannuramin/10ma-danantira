import { ChartColumn, House, Swords, UserRound, Users, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon; match: string[] };

// Five tabs, in the order fixed by Design.md §13.
export const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: "Home", icon: House, match: ["/home"] },
  { href: "/matches", label: "Matches", icon: Swords, match: ["/matches", "/mabar"] },
  { href: "/stats", label: "Stats", icon: ChartColumn, match: ["/stats"] },
  { href: "/community", label: "Community", icon: Users, match: ["/community"] },
  { href: "/profile", label: "Profile", icon: UserRound, match: ["/profile"] },
];

export function isActive(item: NavItem, pathname: string | null): boolean {
  if (!pathname) return false;
  return item.match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

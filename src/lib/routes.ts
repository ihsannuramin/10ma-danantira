// Route groups the proxy uses to decide who may see what.
export const PROTECTED_PREFIXES = ["/home", "/mabar", "/matches", "/stats", "/community", "/profile", "/onboarding"];
export const GUEST_ONLY_PATHS = ["/", "/login", "/register"];

export const HOME_PATH = "/home";
export const LOGIN_PATH = "/login";

export function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Only allow same-site relative redirects after login. */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return HOME_PATH;
  return next;
}

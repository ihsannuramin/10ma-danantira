"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";

/** Shows "saved" once after Edit Profile redirects back with ?saved=1. */
export function SavedToast() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const saved = params.get("saved") === "1";
  // Effects run twice in Strict Mode; show the toast once per save.
  const shown = useRef(false);

  useEffect(() => {
    if (!saved || shown.current) return;
    shown.current = true;
    toast("Profil berhasil disimpan.");
    router.replace(pathname, { scroll: false });
  }, [saved, toast, router, pathname]);

  return null;
}

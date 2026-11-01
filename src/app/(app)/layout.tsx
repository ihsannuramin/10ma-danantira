import { Suspense } from "react";
import { BottomNav, SideNav } from "@/components/layout/app-nav";

// Static chrome only: anything that reads the session lives inside each
// page's own Suspense boundary so the shell stays prerenderable.
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1200px]">
      <Suspense fallback={<div className="hidden w-60 shrink-0 lg:block" />}>
        <SideNav />
      </Suspense>
      <main className="min-w-0 flex-1 pb-[calc(var(--bottom-nav-h)+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}

"use client";

import { Page } from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/state";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Page>
      <div className="pt-10">
        <ErrorState
          title="Halaman ini gagal dimuat."
          description="Mungkin koneksi kamu sedang putus-putus. Coba muat ulang."
          action={<Button onClick={reset}>Coba lagi</Button>}
        />
      </div>
    </Page>
  );
}

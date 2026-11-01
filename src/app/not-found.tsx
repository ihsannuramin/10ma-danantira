import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/state";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-4">
      <ErrorState
        className="w-full"
        title="Halaman tidak ditemukan."
        description="Link-nya mungkin salah atau sudah tidak berlaku."
        action={
          <Link href="/home" className={buttonClasses()}>
            Ke Home
          </Link>
        }
      />
    </main>
  );
}

import { Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Page, TopBar } from "@/components/layout/top-bar";
import { buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";

export const metadata: Metadata = { title: "Community" };

// Community (P1) is out of scope for this iteration.
export default function CommunityPage() {
  return (
    <Page>
      <TopBar title="Community" />
      <EmptyState
        icon={<Users aria-hidden />}
        title="Community segera hadir."
        description="Nanti kamu bisa gabung komunitas tenis di area kamu. Sementara itu, cari mabar dulu yuk."
        action={
          <Link href="/mabar" className={buttonClasses()}>
            Find Mabar
          </Link>
        }
      />
    </Page>
  );
}

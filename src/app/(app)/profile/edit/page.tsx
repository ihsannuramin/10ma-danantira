import type { Metadata } from "next";
import { Suspense } from "react";
import { Page, TopBar } from "@/components/layout/top-bar";
import { EditProfileForm } from "@/components/player/edit-profile-form";
import { Skeleton } from "@/components/ui/card";
import { requirePlayer } from "@/data/auth";
import { getAreas } from "@/data/reference";

export const metadata: Metadata = { title: "Edit Profile" };

export default function EditProfilePage() {
  return (
    <Page>
      <TopBar title="Edit Profile" backHref="/profile" />
      <Suspense fallback={<Skeleton className="h-[32rem] w-full rounded-lg" />}>
        <EditProfile />
      </Suspense>
    </Page>
  );
}

async function EditProfile() {
  const [player, areas] = await Promise.all([requirePlayer(), getAreas()]);
  return <EditProfileForm areas={areas} defaults={player} />;
}

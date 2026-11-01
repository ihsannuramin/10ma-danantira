import { CalendarClock, Hand, LogOut, MapPin, Swords, Target, UserRoundPen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/actions/auth";
import { Page, TopBar } from "@/components/layout/top-bar";
import { RatingCard } from "@/components/rating/rating-card";
import { Avatar } from "@/components/ui/avatar";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/card";
import { requirePlayer } from "@/data/auth";
import {
  AVAILABILITY_LABEL,
  DOMINANT_HAND_LABEL,
  PLAYING_OBJECTIVE_LABEL,
  PLAYING_STYLE_LABEL,
  PREFERRED_FORMAT_LABEL,
} from "@/domain/player/player.constants";
import { levelLabel } from "@/domain/rating/rating.service";
import { SavedToast } from "./saved-toast";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return (
    <Page>
      <TopBar title="My Profile" />
      <Suspense fallback={<ProfileSkeleton />}>
        <Profile />
      </Suspense>
      <Suspense>
        <SavedToast />
      </Suspense>
    </Page>
  );
}

async function Profile() {
  const player = await requirePlayer();
  const rows = [
    { icon: Target, label: "Level", value: levelLabel(player.level) },
    { icon: Swords, label: "Play Style", value: PLAYING_STYLE_LABEL[player.playingStyle] },
    { icon: Target, label: "Tujuan", value: PLAYING_OBJECTIVE_LABEL[player.playingObjective] },
    { icon: UserRoundPen, label: "Preferred", value: PREFERRED_FORMAT_LABEL[player.preferredFormat] },
    ...(player.dominantHand ? [{ icon: Hand, label: "Tangan dominan", value: DOMINANT_HAND_LABEL[player.dominantHand] }] : []),
    {
      icon: CalendarClock,
      label: "Availability",
      value: player.availability.length ? player.availability.map((a) => AVAILABILITY_LABEL[a]).join(", ") : "Belum diisi",
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center gap-4">
        <Avatar name={player.displayName} src={player.photoUrl} size="lg" />
        <div>
          <h2 className="text-h2">{player.displayName}</h2>
          <p className="flex items-center gap-1 text-body-sm text-muted">
            <MapPin className="size-4" aria-hidden />
            {player.areaName}
          </p>
        </div>
      </header>

      <RatingCard player={player} />

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-h3">My Tennis Profile</h3>
          <Link href="/profile/edit" className="flex min-h-11 items-center px-2 text-body-sm font-bold underline underline-offset-4">
            Edit
          </Link>
        </div>
        <dl className="flex flex-col gap-4">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-5 shrink-0 text-muted" aria-hidden />
              <div>
                <dt className="text-caption text-muted">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex flex-col gap-3">
        <Link href="/profile/edit" className={buttonClasses({ variant: "secondary", fullWidth: true })}>
          Edit Profile
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" fullWidth icon={<LogOut className="size-5" aria-hidden />}>
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <Skeleton className="size-20 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <Skeleton className="h-52 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

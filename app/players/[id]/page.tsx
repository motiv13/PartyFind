import { notFound } from "next/navigation";

import { players } from "@/data/player";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileGames from "@/components/profile/ProfileGames";
import ProfileLookingFor from "@/components/profile/ProfileLookingFor";
import ProfileLanguages from "@/components/profile/ProfileLanguages";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileContact from "@/components/profile/ProfileContact";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PlayerProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const player = players.find(
    (p) => p.id === Number(id)
  );

  if (!player) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-12">
  <div className="mx-auto max-w-7xl space-y-8">

<ProfileHeader player={player} />

<div className="grid gap-8 lg:grid-cols-2">

  <ProfileAbout player={player} />

  <ProfileGames player={player} />

  <ProfileLookingFor player={player} />

  <ProfileLanguages player={player} />

  <ProfileContact player={player} />

  <ProfileActions />

</div>

  </div>
</main>
  );
}
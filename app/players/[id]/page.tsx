import { notFound } from "next/navigation";

import { players } from "@/data/player";
import { getProfile } from "@/lib/profile-store";

import SavedPlayerProfile from "@/components/profile/SavedPlayerProfile";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const runtime = "nodejs";

export default async function PlayerProfilePage({
  params,
}: PageProps) {
  const { id } = await params;

  const player = players.find((p) => String(p.id) === id) ?? getProfile(id);

  if (!player) {
    notFound();
  }

  return <SavedPlayerProfile player={player} />;
}

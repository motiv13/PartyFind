import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Player } from "@/types/player";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileAbout from "@/components/profile/ProfileAbout";
import ProfileGames from "@/components/profile/ProfileGames";
import ProfileLookingFor from "@/components/profile/ProfileLookingFor";
import ProfileLanguages from "@/components/profile/ProfileLanguages";
import ProfileActions from "@/components/profile/ProfileActions";
import ProfileContact from "@/components/profile/ProfileContact";
import ProfileTags from "@/components/profile/ProfileTags";

export default function SavedPlayerProfile({ player }: { player: Player }) {
  return (
    <main className="min-h-screen bg-zinc-950">
      <Navbar />
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
        <Link href="/players" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white">
          <ArrowLeft size={16} /> Back to players
        </Link>
        <ProfileHeader player={player} />
        <div className="grid gap-5 sm:gap-8 lg:grid-cols-2">
          <ProfileAbout player={player} />
          <ProfileTags player={player} />
          <ProfileGames player={player} />
          <ProfileLookingFor player={player} />
          <ProfileLanguages player={player} />
          <ProfileContact player={player} />
          <ProfileActions playerId={player.id} playerGame={player.game} />
        </div>
      </div>
      <Footer />
    </main>
  );
}

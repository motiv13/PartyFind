import Image from "next/image";
import type { Player } from "@/types/player";

import {
  Globe,
  Mic,
  Shield,
  Circle,
} from "lucide-react";

type ProfileHeaderProps = {
  player: Player;
};

export default function ProfileHeader({
  player,
}: ProfileHeaderProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

      {/* Banner */}
      <div className="h-56 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700" />

      {/* Content */}
      <div className="relative px-10 pb-10">

        <div className="absolute -top-20">

          <div className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-zinc-900 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 shadow-2xl ring-1 ring-white/10">

            <Image
              src={player.avatar}
              alt={player.name}
              fill
              unoptimized
              className="object-cover"
            />

          </div>

        </div>

        <div className="ml-48 pt-8">

          <div className="flex items-center gap-3">

            <h1 className="text-4xl font-bold text-white">
              {player.name}
            </h1>

            <Circle
              size={12}
              fill={player.online ? "#22c55e" : "#71717a"}
              className={
                player.online
                  ? "text-green-500"
                  : "text-zinc-500"
              }
            />

          </div>

          <p className="mt-2 text-lg text-zinc-400">
            {player.role} • {player.game}
          </p>

          <div className="mt-6 flex flex-wrap gap-5 text-zinc-300">

            <div className="flex items-center gap-2">
              <Shield size={18} />
              {player.ilvl ?? player.rank}
            </div>

            <div className="flex items-center gap-2">
              <Globe size={18} />
              {player.country}
            </div>

            <div className="flex items-center gap-2">
              <Mic size={18} />

              {player.voice
                ? "Discord Available"
                : "No Voice"}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
"use client";

import Image from "next/image";
import type { Player } from "@/types/player";
import { useLanguage } from "@/lib/i18n";

import {
  Globe,
  Mic,
  ListChecks,
  Circle,
} from "lucide-react";

type ProfileHeaderProps = {
  player: Player;
};

export default function ProfileHeader({
  player,
}: ProfileHeaderProps) {
  const { t } = useLanguage();
  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900">

      {/* Banner */}
      <div className="h-40 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700" />

      {/* Content */}
      <div className="relative px-7 pb-7">

        <div className="absolute -top-16">

          <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-900 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 shadow-2xl ring-1 ring-white/10">

            <Image
              src={player.avatar}
              alt={player.name}
              fill
              unoptimized
              className="object-cover"
            />

          </div>

        </div>

        <div className="ml-40 pt-5">

          <div className="flex items-center gap-3">

            <h1 className="text-3xl font-bold text-white">
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
            {[player.role, player.game].filter(Boolean).join(" • ")}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-300">

            <div className="flex items-center gap-2">
              <ListChecks size={18} />
              {player.ilvl ?? player.rank ?? t("Rank not set")}
            </div>

            {player.country && (
              <div className="flex items-center gap-2">
                <Globe size={18} />
                {player.country}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Mic size={18} />

              {player.voice
              ? t("Discord Available")
                : t("No Voice")}
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

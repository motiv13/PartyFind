"use client";

import Image from "next/image";
import type { Player } from "@/types/player";
import Link from "next/link";


import {
  Circle,
  Gamepad2,
  Globe,
  Mic,
  ListChecks,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type PlayerCardProps = {
  player: Player;
};

export default function PlayerCard({
  player,
}: PlayerCardProps) {
  const { t } = useLanguage();
  return (
    <Link href={`/players/${player.id}`} aria-label={`${t("View Profile")}: ${player.name}`} className="group block overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-3">
        <div className="flex items-center gap-2">
          <Circle
            size={10}
            fill={player.online ? "#22c55e" : "#71717a"}
            className={player.online ? "text-green-500" : "text-zinc-500"}
          />

          <span
            className={`text-sm font-medium ${
              player.online
                ? "text-green-400"
                : "text-zinc-400"
            }`}
          >
            {t(player.online ? "Online" : "Offline")}
          </span>
        </div>

        <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-400">
          LFG
        </span>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center px-6 pt-6">
        <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-900 bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-950 shadow-2xl ring-1 ring-white/10">
          <Image
            src={player.avatar}
            alt={player.name}
            fill
            sizes="96px"
            unoptimized
            className="object-cover"
          />
        </div>

        <h2 className="mt-4 text-xl font-bold text-white">
          {player.name}
        </h2>

        <p className="mt-1 text-zinc-400">
          {t("Looking for teammates")}
        </p>
      </div>

      {/* Info */}
      <div className="mt-6 space-y-3 px-5">
        <div className="flex items-center gap-3">
          <Gamepad2
            className="text-blue-400"
            size={20}
          />

          <span className="text-zinc-300">
            {player.game}
          </span>
        </div>

        {(player.role || player.ilvl || player.rank) && (
          <div className="flex items-center gap-3">
            <ListChecks className="text-purple-400" size={20} />
            <span className="text-zinc-300">
              {[player.role, player.ilvl ?? player.rank].filter(Boolean).join(" · ")}
            </span>
          </div>
        )}

        {player.country && (
          <div className="flex items-center gap-3">
            <Globe className="text-emerald-400" size={20} />
            <span className="text-zinc-300">{player.country}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Mic
            className="text-yellow-400"
            size={20}
          />

          <span className="text-zinc-300">
            {player.voice
              ? t("Discord Available")
              : "No Voice Chat"}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-6 flex flex-wrap gap-2 px-6">
        {(player.tags ?? []).slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
            #{tag}
          </span>
        ))}
      </div>

      {/* Button */}
       <div className="px-6 pt-4 pb-6">
         <span className="block w-full rounded-lg bg-blue-600 py-2.5 text-center text-sm font-medium text-white transition-all duration-300 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/20 group-active:scale-[0.98]">
           {t("View Profile")}
         </span>
       </div>
    </Link>
  );
}

"use client";

import type { Player } from "@/types/player";
import { Search } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type ProfileLookingForProps = {
  player: Player;
};

export default function ProfileLookingFor({
  player,
}: ProfileLookingForProps) {
  const { t } = useLanguage();
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600/20 p-3">
          <Search
            size={22}
            className="text-blue-400"
          />
        </div>

        <h2 className="text-2xl font-bold text-white">
          {t("Looking For")}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {player.lookingFor.map((item) => (
          <span
            key={item}
            className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 transition-all duration-300 hover:border-blue-400 hover:bg-blue-500/20"
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

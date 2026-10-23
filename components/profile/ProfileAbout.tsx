"use client";

import { User } from "lucide-react";
import type { Player } from "@/types/player";
import { useLanguage } from "@/lib/i18n";

type ProfileAboutProps = {
  player: Player;
};

export default function ProfileAbout({
  player,
}: ProfileAboutProps) {
  const { t } = useLanguage();
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600/20 p-3">
          <User
            className="text-blue-400"
            size={22}
          />
        </div>

        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {t("About Me")}
        </h2>
      </div>

      <p className="leading-8 text-zinc-300">
        {player.bio}
      </p>
    </section>
  );
}

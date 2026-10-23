"use client";

import type { Player } from "@/types/player";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

type ProfileLanguagesProps = {
  player: Player;
};

export default function ProfileLanguages({
  player,
}: ProfileLanguagesProps) {
  const { t } = useLanguage();
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600/20 p-3">
          <Languages
            size={22}
            className="text-blue-400"
          />
        </div>

        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {t("Languages")}
        </h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {player.languages.map((language) => (
          <span
            key={language}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 text-zinc-200 transition-all duration-300 hover:border-blue-500"
          >
            🌍 {language}
          </span>
        ))}
      </div>
    </section>
  );
}

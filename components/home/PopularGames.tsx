"use client";

import GameCard from "./GameCard";
import { useLanguage } from "@/lib/i18n";

export default function PopularGames() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <h2 className="text-4xl font-bold text-white mb-10">
        {t("Popular Games")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GameCard
          emoji="⚔️"
          name="World of Warcraft"
          players="4,521"
        />

        <GameCard
          emoji="🎯"
          name="Counter-Strike 2"
          players="3,118"
        />

        <GameCard
          emoji="🧙"
          name="League of Legends"
          players="2,876"
        />

        <GameCard
          emoji="🔥"
          name="Valorant"
          players="2,015"
        />
      </div>
    </section>
  );
}

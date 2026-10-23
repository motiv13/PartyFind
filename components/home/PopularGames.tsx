"use client";

import GameCard from "./GameCard";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";

type GameStats = { games: Record<string, number> };

export default function PopularGames() {
  const { t } = useLanguage();
  const [gameCounts, setGameCounts] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as GameStats;
        if (active) setGameCounts(data.games ?? {});
      } catch {
        // Keep the last successful snapshot while the local server reconnects.
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const count = (game: string) => gameCounts?.[game] ?? null;
  return (
    <section className="max-w-7xl mx-auto px-6 py-32">
      <h2 className="text-4xl font-bold text-white mb-10">
        {t("Popular Games")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GameCard
          emoji="⚔️"
          name="World of Warcraft"
          players={count("World of Warcraft")}
        />

        <GameCard
          emoji="🎯"
          name="Counter-Strike 2"
          players={count("Counter-Strike 2")}
        />

        <GameCard
          emoji="🧙"
          name="League of Legends"
          players={count("League of Legends")}
        />

        <GameCard
          emoji="🔥"
          name="Valorant"
          players={count("Valorant")}
        />
      </div>
    </section>
  );
}

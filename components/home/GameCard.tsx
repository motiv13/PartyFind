"use client";

import { useLanguage } from "@/lib/i18n";
import Link from "next/link";

type GameCardProps = {
  emoji: string;
  name: string;
  players: number | null;
};

export default function GameCard({
  emoji,
  name,
  players,
}: GameCardProps) {
  const { language, t } = useLanguage();
  const formattedPlayers = players === null
    ? "—"
    : new Intl.NumberFormat(language === "uk" ? "uk-UA" : "en-US").format(players);
  return (
    <Link href={`/players?game=${encodeURIComponent(name)}`} className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-blue-500/40 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
      <div className="text-5xl mb-4">{emoji}</div>

      <h3 className="text-2xl font-bold text-white">
        {name}
      </h3>

      <p className="text-zinc-400 mt-2">
        {formattedPlayers} {t("players")}
      </p>
    </Link>
  );
}

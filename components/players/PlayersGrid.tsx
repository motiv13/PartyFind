"use client";

import PlayerCard from "./PlayerCard";
import type { Player } from "@/types/player";
import { useLanguage } from "@/lib/i18n";

type PlayersGridProps = {
  players: Player[];
  search: string;
  selectedGame: string;
  selectedCountry: string;
  selectedLanguage: string;
  selectedTag: string;
  selectedLookingFor: string;
  onlineOnly: boolean;
};

export default function PlayersGrid({
  players,
  search,
  selectedGame,
  selectedCountry,
  selectedLanguage,
  selectedTag,
  selectedLookingFor,
  onlineOnly,
}: PlayersGridProps) {
  const { t, language } = useLanguage();
  const filteredPlayers = players.filter((player) => {
    const value = search.trim().toLowerCase();

    const matchesSearch =
      player.name.toLowerCase().includes(value) ||
      player.game.toLowerCase().includes(value) ||
      player.role.toLowerCase().includes(value) ||
      player.country.toLowerCase().includes(value) ||
      player.languages.some((language) => language.toLowerCase().includes(value)) ||
      player.favoriteGames.some((game) => game.toLowerCase().includes(value)) ||
      player.lookingFor.some((item) => item.toLowerCase().includes(value));
    const matchesTaggedSearch = (player.tags ?? []).some((tag) => tag.toLowerCase().includes(value));

    const matchesGame =
      selectedGame === "All" ||
      player.game === selectedGame;

    const matchesOnline =
      !onlineOnly || player.online;

    const matchesCountry = selectedCountry === "All" || player.country === selectedCountry;
    const matchesLanguage = selectedLanguage === "All" || player.languages.some((language) => language === selectedLanguage);
    const matchesTag = selectedTag === "All" || (player.tags ?? []).some((tag) => tag === selectedTag);
    const matchesLookingFor = selectedLookingFor === "All" || player.lookingFor.some((item) => item === selectedLookingFor);

    return (
      (matchesSearch || matchesTaggedSearch) &&
      matchesGame &&
      matchesOnline &&
      matchesCountry &&
      matchesLanguage &&
      matchesTag &&
      matchesLookingFor
    );
  });

  if (filteredPlayers.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">
          {t("No players found")}
        </h2>

        <p className="mt-3 text-zinc-400">
          {t("Try changing your search or filters.")}
        </p>
      </div>
    );
  }

  return (
    <section aria-live="polite">
      <p className="mb-4 text-sm text-zinc-500">{language === "uk" ? `Знайдено гравців: ${filteredPlayers.length}` : `${filteredPlayers.length} ${filteredPlayers.length === 1 ? "player" : "players"} found`}</p>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} />)}
      </div>
    </section>
  );
}

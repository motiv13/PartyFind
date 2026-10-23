"use client";

import { useEffect, useMemo, useState } from "react";

import SearchBar from "@/components/players/SearchBar";
import Filters from "@/components/players/Filters";
import PlayersGrid from "@/components/players/PlayersGrid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { players as samplePlayers } from "@/data/player";
import type { Player } from "@/types/player";
import { countries as countryOptions, languages as languageOptions, lookingForOptions } from "@/data/profile-options";
import { useLanguage } from "@/lib/i18n";
import { games } from "@/data/games";

export default function PlayersPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [selectedGame, setSelectedGame] = useState("All");
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [selectedLookingFor, setSelectedLookingFor] = useState("All");
  const [players, setPlayers] = useState<Player[]>(samplePlayers);

  useEffect(() => {
    const game = new URLSearchParams(window.location.search).get("game");
    if (game && games.includes(game) && game !== "All") setSelectedGame(game);
  }, []);

  useEffect(() => {
    let active = true;
    const loadPlayers = () => fetch("/api/players")
      .then((response) => response.ok ? response.json() : null)
      .then((result: { players?: Player[] } | null) => {
        if (active && result?.players) setPlayers([...result.players, ...samplePlayers]);
      })
      .catch(() => undefined);
    loadPlayers();
    const interval = window.setInterval(loadPlayers, 30_000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  const countries = useMemo(() => [...new Set([...countryOptions, ...players.map((player) => player.country).filter(Boolean)])].sort(), [players]);
  const languages = useMemo(() => [...new Set([...languageOptions, ...players.flatMap((player) => player.languages ?? []).filter(Boolean)])].sort(), [players]);
  const lookingFor = useMemo(() => [...new Set([...lookingForOptions, ...players.flatMap((player) => player.lookingFor ?? []).filter(Boolean)])].sort(), [players]);
  const tags = useMemo(() => [...new Set(players.flatMap((player) => player.tags ?? []).filter(Boolean))].sort(), [players]);

  function resetFilters() {
    setSelectedGame("All");
    setSelectedCountry("All");
    setSelectedLanguage("All");
    setSelectedTag("All");
    setSelectedLookingFor("All");
    setOnlineOnly(false);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-14">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-5xl">
            {t("Find Players")}
          </h1>

          <p className="mt-3 text-base text-zinc-400 sm:mt-4 sm:text-lg">
            {t("Discover teammates for your favorite games.")}
          </p>
        </div>

        <div className="space-y-5">
          <SearchBar
            search={search}
            setSearch={setSearch}
          />

          <Filters
            selectedGame={selectedGame}
            setSelectedGame={setSelectedGame}
            onlineOnly={onlineOnly}
            setOnlineOnly={setOnlineOnly}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            selectedTag={selectedTag}
            setSelectedTag={setSelectedTag}
            selectedLookingFor={selectedLookingFor}
            setSelectedLookingFor={setSelectedLookingFor}
            countries={countries}
            languages={languages}
            lookingFor={lookingFor}
            tags={tags}
            onReset={resetFilters}
          />

          <PlayersGrid
            players={players}
            search={search}
            selectedGame={selectedGame}
            selectedCountry={selectedCountry}
            selectedLanguage={selectedLanguage}
            selectedTag={selectedTag}
            selectedLookingFor={selectedLookingFor}
            onlineOnly={onlineOnly}
          />
        </div>
      </section>
      <Footer />
    </main>
  );
}

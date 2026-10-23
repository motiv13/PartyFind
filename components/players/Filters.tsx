"use client";

import { games } from "@/data/games";
import FilterSelect from "@/components/players/FilterSelect";
import { useLanguage } from "@/lib/i18n";

type FiltersProps = {
  selectedGame: string;
  setSelectedGame: (game: string) => void;

  onlineOnly: boolean;
  setOnlineOnly: (value: boolean) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (language: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  selectedLookingFor: string;
  setSelectedLookingFor: (value: string) => void;
  countries: string[];
  languages: string[];
  lookingFor: string[];
  tags: string[];
  onReset: () => void;
};

export default function Filters({
  selectedGame,
  setSelectedGame,
  onlineOnly,
  setOnlineOnly,
  selectedCountry,
  setSelectedCountry,
  selectedLanguage,
  setSelectedLanguage,
  selectedTag,
  setSelectedTag,
  selectedLookingFor,
  setSelectedLookingFor,
  countries,
  languages,
  lookingFor,
  tags,
  onReset,
}: FiltersProps) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {games.map((game) => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={`shrink-0 rounded-lg border px-3 py-2.5 text-xs transition-all duration-200 sm:px-4 sm:text-sm ${
              selectedGame === game
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-blue-500 hover:text-white"
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <FilterSelect label={t("Country")} value={selectedCountry} allLabel={t("All countries")} options={countries} onChange={setSelectedCountry} />
        <FilterSelect label={t("Language")} value={selectedLanguage} allLabel={t("All languages")} options={languages} onChange={setSelectedLanguage} />
        <FilterSelect label={t("Looking for")} value={selectedLookingFor} allLabel={t("Anything")} options={lookingFor} onChange={setSelectedLookingFor} />
        <FilterSelect label={t("Tag")} value={selectedTag} allLabel={t("All tags")} options={tags} onChange={setSelectedTag} />

      <button
        type="button"
        onClick={() => setOnlineOnly(!onlineOnly)}
        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-all ${
          onlineOnly
            ? "border-green-500 bg-green-600 text-white"
            : "border-zinc-800 bg-zinc-900 text-zinc-400"
        }`}
      >
        <span className="text-lg">🟢</span>

        {t("Online only")}
      </button>
        {(selectedGame !== "All" || selectedCountry !== "All" || selectedLanguage !== "All" || selectedLookingFor !== "All" || selectedTag !== "All" || onlineOnly) && (
          <button type="button" onClick={onReset} className="px-2 py-3 text-sm text-zinc-400 transition hover:text-white">
            {t("Clear filters")}
          </button>
        )}
      </div>
    </div>
  );
}

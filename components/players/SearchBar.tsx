"use client";

import { useLanguage } from "@/lib/i18n";

type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({
  search,
  setSearch,
}: SearchBarProps) {
  const { language } = useLanguage();
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 sm:p-5">
      <input
        type="text"
        placeholder={language === "uk" ? "Пошук гравців, ігор, ролей або тегів…" : "Search players, games, roles, or tags..."}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full min-w-0 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-blue-500 sm:px-5 sm:py-4"
      />
    </div>
  );
}

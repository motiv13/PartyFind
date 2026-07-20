"use client";

import { useState } from "react";

import SearchBar from "@/components/players/SearchBar";
import Filters from "@/components/players/Filters";
import PlayersGrid from "@/components/players/PlayersGrid";

export default function PlayersPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold">
            Find Players
          </h1>

          <p className="mt-4 text-lg text-zinc-400">
            Discover teammates for your favorite games.
          </p>
        </div>

        <div className="space-y-8">
          <SearchBar
            search={search}
            setSearch={setSearch}
          />

          <Filters />

          <PlayersGrid search={search} />
        </div>
      </section>
    </main>
  );
}
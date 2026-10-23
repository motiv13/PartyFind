"use client";

import { Tag } from "lucide-react";
import type { Player } from "@/types/player";
import { useLanguage } from "@/lib/i18n";

export default function ProfileTags({ player }: { player: Player }) {
  const { t } = useLanguage();
  if (!player.tags?.length) return null;

  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-purple-600/20 p-3"><Tag className="text-purple-300" size={22} /></div>
        <div>
          <h2 className="text-xl font-bold text-white">{t("Tags")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("Search for these to find this player.")}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        {player.tags.map((tag) => <span key={tag} className="rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-200">#{tag}</span>)}
      </div>
    </section>
  );
}

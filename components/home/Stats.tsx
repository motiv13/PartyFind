"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/i18n";

type StatsData = {
  players: number;
  communities: number;
  guilds: number;
  online: number;
};

const emptyStats: StatsData = { players: 0, communities: 0, guilds: 0, online: 0 };

export default function Stats() {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/stats", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as StatsData;
        if (active) setStats(data);
      } catch {
        // Keep the last successful snapshot while the local server reconnects.
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const values = stats ?? emptyStats;
  const formatter = new Intl.NumberFormat(language === "uk" ? "uk-UA" : "en-US");
  const items = [
    { label: "Players", value: values.players },
    { label: "Communities", value: values.communities },
    { label: "Guilds", value: values.guilds },
    { label: "Online now", value: values.online, live: true },
  ];

  return (
    <section aria-label={t("Live statistics")} className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-center transition-colors hover:border-blue-500/50 sm:p-7">
            <h3 className="text-3xl font-bold tabular-nums text-blue-400 sm:text-4xl">
              {stats ? formatter.format(item.value) : "—"}
            </h3>
            <p className="mt-2 flex items-center justify-center gap-2 text-sm text-zinc-400 sm:text-base">
              {item.live && <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-400" />}
              {t(item.label)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n";

const stats = [
  {
    value: "18K+",
    label: "Players",
  },
  {
    value: "120+",
    label: "Communities",
  },
  {
    value: "30+",
    label: "Games",
  },
  {
    value: "24/7",
    label: "Activity",
  },
];

export default function Stats() {
  const { t } = useLanguage();
  return (
    <section className="max-w-7xl mx-auto px-6 py-18">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="text-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 hover:border-blue-500 transition-all duration-300"
          >
            <h3 className="text-5xl font-bold text-blue-400">
              {stat.value}
            </h3>

            <p className="mt-3 text-zinc-400">
              {t(stat.label)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

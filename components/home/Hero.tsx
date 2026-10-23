"use client";

import { useLanguage } from "@/lib/i18n";

export default function Hero() {
  const { t } = useLanguage();
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute left-1/2 top-20 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-600/20 blur-3xl"></div>

        <div className="absolute right-20 top-40 h-72 w-72 rounded-full bg-purple-600/10 blur-3xl"></div>

        <div className="absolute left-20 bottom-20 h-72 w-72 rounded-full bg-cyan-600/10 blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-28 text-center">
        <span className="inline-block rounded-full border border-blue-500/30 bg-blue-600/20 px-4 py-2 text-sm font-medium text-blue-400">
          🔥 {t("Find teammates faster")}
        </span>

        <h1 className="mt-8 text-5xl font-extrabold leading-tight text-white md:text-7xl">
          {t("Find your perfect")}
          <br />
          <span className="text-blue-500">{t("gaming party")}</span>
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-lg leading-8 text-zinc-400 md:text-xl">
          {t("Connect with gamers from around the world, build communities, and never play alone again.")}
        </p>

        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:bg-blue-500">
            {t("Find Players")}
          </button>

          <button className="rounded-xl border border-zinc-700 px-8 py-4 font-semibold text-white transition-all duration-300 hover:border-blue-500 hover:bg-zinc-900">
            {t("Browse Communities")}
          </button>
        </div>

      </div>
    </section>
  );
}

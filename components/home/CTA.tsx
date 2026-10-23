"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function CTA() {
  const { t } = useLanguage();
  return (
    <section className="max-w-5xl mx-auto px-6 py-32">
      <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-600/10 to-zinc-900 p-14 text-center">

        <h2 className="text-5xl font-bold text-white">
          {t("Ready to find your next squad?")}
        </h2>

        <p className="mt-6 text-xl text-zinc-400">
          {t("Join thousands of gamers already using PartyFind.")}
        </p>

        <Link href="/register" className="mt-10 inline-flex rounded-xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:scale-105 hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950">
          {t("Get Started")}
        </Link>

      </div>
    </section>
  );
}

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

"use client";

import { useLanguage } from "@/lib/i18n";

export default function CommunitiesPage() {
  const { t } = useLanguage();
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-4xl font-bold">{t("Communities")}</h1>
        <p className="mt-3 text-zinc-400">{t("Find a group of players who share your games and goals.")}</p>
      </section>
      <Footer />
    </main>
  );
}

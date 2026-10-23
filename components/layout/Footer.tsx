"use client";

import { useLanguage } from "@/lib/i18n";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-zinc-800 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-4">

        <h2 className="font-bold text-white text-xl">
          PartyFind
        </h2>

        <p className="text-zinc-500 text-sm">
          © 2026 PartyFind. {t("Made with ❤️ in Ukraine.")}
        </p>

      </div>
    </footer>
  );
}

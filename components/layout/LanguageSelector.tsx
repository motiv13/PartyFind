"use client";

import { Globe2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return <label className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/70 px-2.5 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700" aria-label="Language">
    <Globe2 size={14} className="text-blue-400" />
    <select value={language} onChange={(event) => setLanguage(event.target.value as "en" | "uk")} className="cursor-pointer bg-transparent outline-none" aria-label="Language">
      <option value="en" className="bg-zinc-900">EN</option><option value="uk" className="bg-zinc-900">UA</option>
    </select>
  </label>;
}

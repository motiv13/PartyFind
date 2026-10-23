"use client";

import Link from "next/link";
import { useState } from "react";
import { Gamepad2, Menu, X } from "lucide-react";
import AuthActions from "@/components/layout/AuthActions";
import LanguageSelector from "@/components/layout/LanguageSelector";
import NotificationBell from "@/components/layout/NotificationBell";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = [["/", "Home"], ["/players", "Players"], ["/feed", "Feed"], ["/communities", "Communities"], ["/friends", "Friends"], ["/messages", "Messages"], ["/invites", "Invites"]];
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
      <div className="flex h-14 items-center justify-between gap-1 lg:h-16 lg:gap-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex min-w-0 shrink-0 items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
        >
          <Gamepad2
            size={23}
            className="text-blue-500 transition-colors duration-300"
          />

          <span className="text-lg font-bold tracking-tight text-white min-[380px]:text-xl max-[350px]:hidden">
            PartyFind
          </span>
        </Link>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-4 xl:gap-5 lg:flex">
          {nav.map(([href, label]) => <Link key={href} href={href} className="text-sm text-zinc-400 transition duration-200 hover:text-white">{t(label)}</Link>)}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2"><NotificationBell /><LanguageSelector /><AuthActions /><button type="button" aria-label={t("Toggle navigation")} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-300 transition hover:border-zinc-700 hover:text-white lg:hidden">{menuOpen ? <X size={18} /> : <Menu size={18} />}</button></div>
      </div>
      {menuOpen && <div id="mobile-navigation" className="absolute left-3 right-3 top-full z-50 mt-2 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/40 lg:hidden">
        <nav aria-label={t("Main navigation")} className="grid gap-1">
          {nav.map(([href, label]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white">{t(label)}</Link>)}
        </nav>
      </div>}
      </div>
    </header>
  );
}

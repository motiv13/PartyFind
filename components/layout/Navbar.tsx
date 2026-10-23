"use client";

import Link from "next/link";
import { Gamepad2 } from "lucide-react";
import AuthActions from "@/components/layout/AuthActions";
import LanguageSelector from "@/components/layout/LanguageSelector";
import NotificationBell from "@/components/layout/NotificationBell";
import { useLanguage } from "@/lib/i18n";

export default function Navbar() {
  const { t } = useLanguage();
  const nav = [["/", "Home"], ["/players", "Players"], ["/feed", "Feed"], ["/communities", "Communities"], ["/friends", "Friends"], ["/messages", "Messages"], ["/invites", "Invites"]];
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-transform duration-300 hover:scale-[1.02]"
        >
          <Gamepad2
            size={25}
            className="text-blue-500 transition-colors duration-300"
          />

          <span className="text-xl font-bold tracking-tight text-white">
            PartyFind
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-5 lg:flex">
          {nav.map(([href, label]) => <Link key={href} href={href} className="text-sm text-zinc-400 transition duration-200 hover:text-white">{t(label)}</Link>)}
        </nav>

        <div className="flex shrink-0 items-center gap-2"><NotificationBell /><LanguageSelector /><AuthActions /></div>
      </div>
    </header>
  );
}

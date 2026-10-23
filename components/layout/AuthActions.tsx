"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import type { Player } from "@/types/player";
import { useLanguage } from "@/lib/i18n";

export default function AuthActions() {
  const { t } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [profile, setProfile] = useState<Pick<Player, "id" | "name" | "avatar"> | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }

    let active = true;
    const loadProfile = () => {
      fetch("/api/profile")
        .then((response) => response.ok ? response.json() : null)
        .then((result: { profile?: Player } | null) => {
          if (active && result?.profile) {
            setProfile({ id: result.profile.id, name: result.profile.name, avatar: result.profile.avatar });
          }
        })
        .catch(() => undefined);
    };

    loadProfile();
    window.addEventListener("partyfind:profile-updated", loadProfile);
    return () => {
      active = false;
      window.removeEventListener("partyfind:profile-updated", loadProfile);
    };
  }, [session?.user?.id]);

  if (isPending) {
    return <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-800/70" aria-label={t("Loading account")} />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/profile" title="Open your profile settings" className="flex min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-zinc-300 transition hover:bg-zinc-900 hover:text-white">
          <span className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-800 text-xs font-semibold text-zinc-300">
            {profile?.avatar ? <Image src={profile.avatar} alt="" fill unoptimized className="object-cover" /> : (profile?.name ?? session.user.name).slice(0, 1).toUpperCase()}
          </span>
          <span className="max-w-28 truncate text-sm font-medium sm:max-w-36">{profile?.name ?? session.user.name}</span>
        </Link>
        <button
          type="button"
          onClick={() => void authClient.signOut({ fetchOptions: { onSuccess: () => window.location.assign("/") } })}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          {t("Sign out")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-white transition hover:text-blue-400">{t("Login")}</Link>
      <Link href="/register" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-blue-500">{t("Register")}</Link>
    </div>
  );
}

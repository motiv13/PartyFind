"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";
import type { PartyFindNotification } from "@/lib/notification-store";

type NotificationData = { notifications: PartyFindNotification[]; unreadCount: number };

export default function NotificationBell() {
  const { data: session } = authClient.useSession();
  const { t, language } = useLanguage();
  const [data, setData] = useState<NotificationData>({ notifications: [], unreadCount: 0 });
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!session?.user) return;
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (response.ok) setData(await response.json() as NotificationData);
    } catch { /* Keep the last known notification state while offline. */ }
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) { setData({ notifications: [], unreadCount: 0 }); return; }
    void refresh();
    const interval = window.setInterval(() => void refresh(), 20_000);
    return () => window.clearInterval(interval);
  }, [refresh, session?.user]);

  async function markRead(id: string) {
    setData((current) => ({ ...current, notifications: current.notifications.map((item) => item.id === id ? { ...item, read: true } : item), unreadCount: Math.max(0, current.unreadCount - (data.notifications.find((item) => item.id === id)?.read ? 0 : 1)) }));
    try {
      const response = await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }) });
      if (response.ok) setData(await response.json() as NotificationData);
    } catch { /* The unread state will reconcile on the next refresh. */ }
  }

  if (!session?.user) return null;
  const hrefFor = (item: PartyFindNotification) => item.kind === "friend_request" || item.kind === "friend_accepted" ? "/friends" : item.kind.startsWith("party_invite") ? "/invites" : `/messages/${item.referenceId}`;
  const labelFor = (kind: PartyFindNotification["kind"]) => t(({ friend_request: "sent you a friend request", friend_accepted: "accepted your friend request", party_invite: "invited you to a party", party_invite_accepted: "accepted your party invitation", party_invite_declined: "declined your party invitation", message: "sent you a message" })[kind]);

  return <div className="relative">
    <button type="button" aria-label={t("Notifications")} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="relative grid h-9 w-9 place-items-center rounded-lg border border-zinc-800 bg-zinc-900/70 text-zinc-300 transition hover:border-zinc-700 hover:text-white">
      <Bell size={17} />
      {data.unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-4 min-w-4 place-items-center rounded-full bg-blue-500 px-1 text-[9px] font-bold leading-none text-white">{data.unreadCount > 9 ? "9+" : data.unreadCount}</span>}
    </button>
    {open && <div className="absolute right-0 top-11 z-[60] w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3"><h2 className="text-sm font-semibold text-white">{t("Notifications")}</h2>{data.unreadCount > 0 && <span className="rounded-full bg-blue-500/15 px-2 py-1 text-[10px] font-semibold text-blue-300">{data.unreadCount} {t("new")}</span>}</div>
      <div className="max-h-[min(28rem,70vh)] overflow-y-auto">
        {data.notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-zinc-500">{t("You’re all caught up.")}</p> : data.notifications.map((item) => <Link key={item.id} href={hrefFor(item)} onClick={() => void markRead(item.id)} className={`flex gap-3 border-b border-zinc-900 px-4 py-3 transition hover:bg-zinc-900 ${item.read ? "opacity-70" : "bg-blue-500/[0.04]"}`}>
          <span className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900"><Image src={item.actorAvatar} alt="" fill unoptimized className="object-cover" /></span>
          <span className="min-w-0 flex-1"><span className="block text-xs leading-5 text-zinc-300"><strong className="font-semibold text-white">{item.actorName}</strong> {labelFor(item.kind)}</span><time className="mt-1 block text-[10px] text-zinc-600">{new Intl.DateTimeFormat(language === "uk" ? "uk-UA" : "en-US", { dateStyle: "short", timeStyle: "short" }).format(new Date(`${item.createdAt.replace(" ", "T")}Z`))}</time></span>
          {!item.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-400" />}
        </Link>)}
      </div>
    </div>}
  </div>;
}

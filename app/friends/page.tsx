"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock3, UserMinus, UserRound, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { FriendRelationship } from "@/types/friend";
import { useLanguage } from "@/lib/i18n";

type PageState = "loading" | "ready" | "signed-out" | "error";

export default function FriendsPage() {
  const { t } = useLanguage();
  const [relationships, setRelationships] = useState<FriendRelationship[]>([]);
  const [state, setState] = useState<PageState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/friends")
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setState("signed-out");
          return null;
        }
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ relationships: FriendRelationship[] }>;
      })
      .then((result) => {
        if (active && result) {
          setRelationships(result.relationships);
          setState("ready");
        }
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [refreshKey]);

  async function updateRelationship(item: FriendRelationship, action: "accept" | "decline" | "cancel" | "remove") {
    setBusyId(item.requestId);
    setMessage("");
    try {
      const response = await fetch(`/api/friends/${item.requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error();
      setRefreshKey((value) => value + 1);
    } catch {
      setMessage("Could not update this friend request. Please try again.");
    } finally {
      setBusyId("");
    }
  }

  const incoming = relationships.filter((item) => item.direction === "incoming");
  const outgoing = relationships.filter((item) => item.direction === "outgoing");
  const friends = relationships.filter((item) => item.direction === "friend");

  function renderCard(item: FriendRelationship, actions: ReactNode) {
    return (
      <article key={item.requestId} className="relative flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-blue-500/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
            {item.avatar && <Image src={item.avatar} alt="" fill unoptimized className="object-cover" />}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{item.name}</p>
            <p className="mt-1 truncate text-sm text-zinc-400">{[item.role, item.game, item.country].filter(Boolean).join(" · ") || "PartyFind player"}</p>
          </div>
        </div>
        <div className="relative z-20 flex flex-wrap gap-2">{actions}</div>
        <Link href={`/players/${item.playerId}`} aria-label={`${t("View Profile")}: ${item.name}`} className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" />
      </article>
    );
  }

  const actionButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:opacity-50";
  const acceptButtonClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="mb-9 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400"><UserRound size={23} /></span>
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">{t("Your network")}</p><h1 className="mt-1 text-3xl font-bold">{t("Friends")}</h1></div>
        </div>

        {state === "loading" && <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">{t("Loading friends…")}</p>}
        {state === "signed-out" && <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><h2 className="text-xl font-semibold">{t("Sign in to view your friends")}</h2><p className="mt-2 text-sm text-zinc-400">{t("Friend requests are connected to your PartyFind account.")}</p><Link href="/login" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">{t("Sign in")}</Link></div>}
        {state === "error" && <p role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-300">{t("Could not load your friends. Please refresh the page and try again.")}</p>}
        {state === "ready" && <div className="space-y-10">
          {message && <p role="alert" className="text-sm text-rose-400">{message}</p>}
          <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{t("Friend requests")}</h2><span className="text-sm text-zinc-500">{incoming.length}</span></div>
            {incoming.length ? <div className="space-y-3">{incoming.map((item) => renderCard(item, <>
              <button type="button" disabled={busyId === item.requestId} onClick={() => void updateRelationship(item, "accept")} className={acceptButtonClass}><Check size={16} />{t("Accept")}</button>
              <button type="button" disabled={busyId === item.requestId} onClick={() => void updateRelationship(item, "decline")} className={actionButtonClass}><X size={16} />{t("Decline")}</button>
            </>))}</div> : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-500">{t("No incoming requests right now.")}</p>}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{t("Your friends")}</h2><span className="text-sm text-zinc-500">{friends.length}</span></div>
            {friends.length ? <div className="space-y-3">{friends.map((item) => renderCard(item, <button type="button" disabled={busyId === item.requestId} onClick={() => void updateRelationship(item, "remove")} className={actionButtonClass}><UserMinus size={16} />{t("Remove")}</button>))}</div> : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-500">{t("You have no friends yet. Find a player and send them a request.")}</p>}
          </section>

          {outgoing.length > 0 && <section>
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{t("Sent requests")}</h2><span className="text-sm text-zinc-500">{outgoing.length}</span></div>
            <div className="space-y-3">{outgoing.map((item) => renderCard(item, <button type="button" disabled={busyId === item.requestId} onClick={() => void updateRelationship(item, "cancel")} className={actionButtonClass}><Clock3 size={16} />{t("Cancel request")}</button>))}</div>
          </section>}
        </div>}
      </section>
      <Footer />
    </main>
  );
}

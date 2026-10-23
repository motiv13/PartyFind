"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MessageCircle, UsersRound } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { ConversationSummary } from "@/types/message";
import { useLanguage } from "@/lib/i18n";

export default function MessagesPage() {
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/messages", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setState("signed-out");
          return null;
        }
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ conversations: ConversationSummary[] }>;
      })
      .then((result) => {
        if (active && result) {
          setConversations(result.conversations);
          setState("ready");
        }
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="mb-9 flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-400"><MessageCircle size={23} /></span>
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">{t("Direct messages")}</p><h1 className="mt-1 text-3xl font-bold">{t("Messages")}</h1></div>
        </div>

        {state === "loading" && <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">{t("Loading messages…")}</p>}
        {state === "signed-out" && <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><h2 className="text-xl font-semibold">{t("Sign in to view your messages")}</h2><Link href="/login" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">{t("Sign in")}</Link></div>}
        {state === "error" && <p role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-300">{t("Could not load your messages. Please refresh the page and try again.")}</p>}
        {state === "ready" && (conversations.length ? <div className="space-y-3">{conversations.map((conversation) => (
          <Link key={conversation.id} href={`/messages/${conversation.id}`} className="flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 transition hover:border-blue-500/40 hover:bg-zinc-900">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800"><Image src={conversation.avatar} alt="" fill unoptimized className="object-cover" /></div>
            <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate font-semibold text-white">{conversation.name}</p><time className="shrink-0 text-xs text-zinc-500">{conversation.updatedAt}</time></div><p className="mt-1 truncate text-sm text-zinc-400">{conversation.lastMessage || [conversation.role, conversation.game].filter(Boolean).join(" · ") || "Start a conversation"}</p></div>
          </Link>
        ))}</div> : <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-zinc-800 text-zinc-400"><UsersRound size={22} /></span><h2 className="mt-4 text-xl font-semibold">{t("No conversations yet")}</h2><p className="mt-2 text-sm text-zinc-400">{t("Open a registered player’s profile and select Message to start a chat.")}</p><Link href="/players" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500">{t("Find players")}</Link></div>)}
      </section>
      <Footer />
    </main>
  );
}

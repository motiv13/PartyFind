"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { ConversationDetails } from "@/types/message";
import { useLanguage } from "@/lib/i18n";

export default function ConversationPage({ conversationId }: { conversationId: string }) {
  const { t } = useLanguage();
  const [details, setDetails] = useState<ConversationDetails | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(`/api/messages/${conversationId}`, { cache: "no-store" });
        if (response.status === 401) {
          if (active) setState("signed-out");
          return;
        }
        if (!response.ok) throw new Error();
        const result = await response.json() as ConversationDetails;
        if (active) {
          setDetails(result);
          setState("ready");
        }
      } catch {
        if (active) setState("error");
      }
    };
    void load();
    const interval = window.setInterval(() => { void load(); }, 4000);
    return () => { active = false; window.clearInterval(interval); };
  }, [conversationId, refreshKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [details?.messages.length]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (response.status === 401) {
        setState("signed-out");
        return;
      }
      if (!response.ok) throw new Error();
      setDraft("");
      setRefreshKey((value) => value + 1);
    } catch {
      setErrorMessage("Could not send the message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <Link href="/messages" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"><ArrowLeft size={16} />{t("All messages")}</Link>
        {state === "loading" && <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">{t("Loading conversation…")}</p>}
        {state === "signed-out" && <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><h2 className="text-xl font-semibold">{t("Sign in to read this conversation")}</h2><Link href="/login" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">{t("Sign in")}</Link></div>}
        {state === "error" && <p role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-300">{t("Conversation not found or you do not have access to it.")}</p>}
        {state === "ready" && details && <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <header className="flex items-center gap-4 border-b border-zinc-800 p-5">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800"><Image src={details.otherPlayer.avatar} alt="" fill unoptimized className="object-cover" /></div>
            <div className="min-w-0"><h1 className="truncate text-lg font-semibold">{details.otherPlayer.name}</h1><p className="mt-1 truncate text-sm text-zinc-400">{[details.otherPlayer.role, details.otherPlayer.game].filter(Boolean).join(" · ")}</p></div>
            <Link href={`/players/${details.otherPlayer.playerId}`} className="ml-auto text-sm text-blue-400 hover:text-blue-300">{t("Profile")}</Link>
          </header>

          <div className="flex max-h-[60vh] min-h-72 flex-col gap-3 overflow-y-auto p-5" aria-live="polite">
            {details.messages.length === 0 && <div className="m-auto max-w-sm text-center text-sm text-zinc-500"><MessageCircle size={25} className="mx-auto mb-3 text-zinc-600" />{t("Say hello and start the conversation.")}</div>}
            {details.messages.map((message) => {
              const ownMessage = message.senderId !== details.otherPlayer.playerId;
              return <div key={message.id} className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${ownMessage ? "self-end rounded-br-md bg-blue-600 text-white" : "self-start rounded-bl-md bg-zinc-800 text-zinc-100"}`}>
                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                <time className={`mt-1 block text-right text-[10px] ${ownMessage ? "text-blue-100/70" : "text-zinc-500"}`}>{message.createdAt}</time>
              </div>;
            })}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="border-t border-zinc-800 p-4">
            {errorMessage && <p role="alert" className="mb-3 text-sm text-rose-400">{errorMessage}</p>}
            <div className="flex items-end gap-3">
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={2} placeholder="Write a message…" className="max-h-36 min-h-12 flex-1 resize-y rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" />
              <button type="submit" disabled={sending || !draft.trim()} aria-label="Send message" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"><Send size={18} /></button>
            </div>
            <p className="mt-2 text-right text-xs text-zinc-600">{draft.length}/2000</p>
          </form>
        </div>}
      </section>
      <Footer />
    </main>
  );
}

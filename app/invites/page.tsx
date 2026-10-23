"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Clock3, Gamepad2, Send, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { PartyInvite } from "@/types/invite";
import { useLanguage } from "@/lib/i18n";

type PageState = "loading" | "ready" | "signed-out" | "error";

export default function InvitesPage() {
  const { t } = useLanguage();
  const [invites, setInvites] = useState<PartyInvite[]>([]);
  const [state, setState] = useState<PageState>("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/invites", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 401) {
          if (active) setState("signed-out");
          return null;
        }
        if (!response.ok) throw new Error();
        return response.json() as Promise<{ invites: PartyInvite[] }>;
      })
      .then((result) => {
        if (active && result) {
          setInvites(result.invites);
          setState("ready");
        }
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, [refreshKey]);

  async function updateInvite(invite: PartyInvite, action: "accept" | "decline" | "cancel") {
    setBusyId(invite.id);
    setMessage("");
    try {
      const response = await fetch(`/api/invites/${invite.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error();
      setRefreshKey((value) => value + 1);
    } catch {
      setMessage("Could not update this invitation. Please try again.");
    } finally {
      setBusyId("");
    }
  }

  const incoming = invites.filter((invite) => invite.direction === "incoming" && invite.status === "pending");
  const outgoing = invites.filter((invite) => invite.direction === "outgoing" && invite.status === "pending");
  const history = invites.filter((invite) => invite.status !== "pending");

  function renderCard(invite: PartyInvite, actions?: ReactNode) {
    return <article key={invite.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <Link href={`/players/${invite.playerId}`} className="flex min-w-0 flex-1 items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800"><Image src={invite.avatar} alt="" fill unoptimized className="object-cover" /></div>
          <div className="min-w-0"><p className="truncate font-semibold text-white">{invite.playerName}</p><p className="mt-1 truncate text-sm text-zinc-400">{invite.role || t("PartyFind player")}</p></div>
        </Link>
        <div className="flex items-center gap-2 self-start rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-300"><Gamepad2 size={15} />{invite.game}</div>
      </div>
      {invite.note && <p className="mt-4 whitespace-pre-wrap rounded-xl bg-zinc-950/70 p-4 text-sm leading-6 text-zinc-300">{invite.note}</p>}
      <div className="mt-4 flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-500"><Clock3 size={14} />{invite.createdAt}{invite.status !== "pending" && <span className={`ml-2 rounded-full px-2 py-1 ${invite.status === "accepted" ? "bg-blue-500/10 text-blue-300" : "bg-zinc-800 text-zinc-400"}`}>{t(invite.status === "accepted" ? "Accepted" : "Declined")}</span>}</div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </article>;
  }

  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:text-white disabled:opacity-50";
  const acceptClass = "inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50";

  return <main className="min-h-screen bg-zinc-950 text-white">
    <Navbar />
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
      <div className="mb-9 flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-green-500/10 text-green-300"><Gamepad2 size={23} /></span><div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-green-300">{t("Find your group")}</p><h1 className="mt-1 text-3xl font-bold">{t("Party invites")}</h1></div></div>
      {state === "loading" && <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">{t("Loading invitations…")}</p>}
      {state === "signed-out" && <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-7"><h2 className="text-xl font-semibold">{t("Sign in to view party invites")}</h2><Link href="/login" className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white">{t("Sign in")}</Link></div>}
      {state === "error" && <p role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-rose-300">{t("Could not load party invites. Please refresh the page and try again.")}</p>}
      {state === "ready" && <div className="space-y-9">
        {message && <p role="alert" className="text-sm text-rose-400">{message}</p>}
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{t("Incoming")}</h2><span className="text-sm text-zinc-500">{incoming.length}</span></div>
          {incoming.length ? <div className="space-y-3">{incoming.map((invite) => renderCard(invite, <>
            <button type="button" disabled={busyId === invite.id} onClick={() => void updateInvite(invite, "accept")} className={acceptClass}><Check size={16} />{t("Accept")}</button>
            <button type="button" disabled={busyId === invite.id} onClick={() => void updateInvite(invite, "decline")} className={buttonClass}><X size={16} />{t("Decline")}</button>
          </>))}</div> : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-500">{t("No incoming party invites.")}</p>}
        </section>
        <section><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold">{t("Sent")}</h2><span className="text-sm text-zinc-500">{outgoing.length}</span></div>
          {outgoing.length ? <div className="space-y-3">{outgoing.map((invite) => renderCard(invite, <button type="button" disabled={busyId === invite.id} onClick={() => void updateInvite(invite, "cancel")} className={buttonClass}><Send size={15} />{t("Cancel invite")}</button>))}</div> : <p className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 text-sm text-zinc-500">{t("You have no pending invites sent.")}</p>}
        </section>
        {history.length > 0 && <section><h2 className="mb-4 text-xl font-semibold">{t("Past invitations")}</h2><div className="space-y-3">{history.map((invite) => renderCard(invite))}</div></section>}
        {!invites.length && <p className="text-center text-sm text-zinc-500">{t("Open a registered player’s profile and choose Invite to Party to get started.")}</p>}
      </div>}
    </section>
    <Footer />
  </main>;
}

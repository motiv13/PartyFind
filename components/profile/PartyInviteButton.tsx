"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Gamepad2, Send, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { games } from "@/data/games";

export default function PartyInviteButton({ playerId, playerGame }: { playerId: string | number; playerGame: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState(games.includes(playerGame) && playerGame !== "All" ? playerGame : games[1]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const unsupported = typeof playerId !== "string";

  async function sendInvite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (unsupported || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, game, note }),
      });
      if (response.status === 401) {
        setSignedOut(true);
        return;
      }
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error === "invite_already_pending" ? "An invitation for this game is already pending." : result.error === "cannot_invite_yourself" ? "You cannot invite yourself." : "Could not send the invitation.");
        return;
      }
      setSent(true);
      setOpen(false);
    } catch {
      setError("Could not connect to PartyFind. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {unsupported ? (
        <button type="button" disabled className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-500/40 bg-green-500/10 py-3 font-semibold text-green-300 opacity-60"><Gamepad2 size={20} />{t("Demo profile")}</button>
      ) : sent ? (
        <Link href="/invites" className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-500/40 bg-green-500/10 py-3 font-semibold text-green-300 transition hover:bg-green-500/20"><Gamepad2 size={20} />{t("Invitation sent · View")}</Link>
      ) : <>
        <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-500/40 bg-green-500/10 py-3 font-semibold text-green-300 transition hover:bg-green-500/20"><Gamepad2 size={20} />{t("Invite to Party")}</button>
        {open && <form onSubmit={sendInvite} className="mt-4 space-y-3 rounded-xl border border-zinc-800 bg-zinc-950 p-4">
          <label className="block text-sm font-medium text-zinc-300">Game
            <select value={game} onChange={(event) => setGame(event.target.value)} className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-green-500">
              {games.filter((item) => item !== "All").map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-zinc-300">{t("Message")} <span className="font-normal text-zinc-500">{t("(optional)")}</span>
            <textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={280} rows={3} placeholder="Want to join our group tonight?" className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-green-500" />
          </label>
          {signedOut && <p className="text-sm text-amber-300">{t("Sign in before sending an invitation.")} <Link href="/login" className="underline">{t("Sign in")}</Link></p>}
          {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"><Send size={15} />{busy ? "Sending…" : "Send invite"}</button>
            <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-lg border border-zinc-700 text-zinc-400 hover:text-white" aria-label={t("Close invitation form")}><X size={16} /></button>
          </div>
        </form>}
      </>}
      {unsupported && <p className="mt-2 text-center text-xs text-zinc-500">{t("This sample profile is not connected to a player account.")}</p>}
    </div>
  );
}

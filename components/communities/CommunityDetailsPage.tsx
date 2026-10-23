"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Crown, Gamepad2, MapPin, Pencil, Save, UsersRound, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { games } from "@/data/games";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";

type Community = {
  id: string; kind: "community" | "guild"; name: string; game: string; region: string; description: string; recruiting: boolean;
  ownerId: string; ownerName: string; ownerAvatar: string; memberCount: number; isMember: boolean; isOwner: boolean;
};
type Member = { id: string; name: string; avatar: string; hasProfile: boolean; role: "owner" | "member" };

export default function CommunityDetailsPage({ communityId }: { communityId: string }) {
  const { t } = useLanguage();
  const { data: session } = authClient.useSession();
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [game, setGame] = useState("");
  const [region, setRegion] = useState("");
  const [description, setDescription] = useState("");
  const [recruiting, setRecruiting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadCommunity = useCallback(async () => {
    try {
      const response = await fetch(`/api/communities/${encodeURIComponent(communityId)}`, { cache: "no-store" });
      if (response.status === 404) { setState("missing"); return; }
      if (!response.ok) throw new Error();
      const result = await response.json() as { community: Community; members: Member[] };
      setCommunity(result.community);
      setMembers(result.members);
      setState("ready");
    } catch { setState("error"); }
  }, [communityId]);

  useEffect(() => { void loadCommunity(); }, [loadCommunity]);

  function openEditor() {
    if (!community) return;
    setName(community.name);
    setGame(community.game);
    setRegion(community.region);
    setDescription(community.description);
    setRecruiting(community.recruiting);
    setError("");
    setEditing(true);
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/communities/${encodeURIComponent(communityId)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, game, region, description, recruiting }),
      });
      if (!response.ok) throw new Error("Could not save group details. Try again.");
      setEditing(false);
      await loadCommunity();
    } catch (reason) { setError(reason instanceof Error ? t(reason.message) : t("Could not save group details. Try again.")); }
    finally { setBusy(false); }
  }

  async function updateMembership() {
    if (!community || !session?.user || busy) {
      if (!session?.user) setError(t("Sign in to join this group."));
      return;
    }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/communities", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: community.isMember ? "leave" : "join", communityId: community.id }),
      });
      if (!response.ok) throw new Error("Could not update membership. Please try again.");
      await loadCommunity();
    } catch (reason) { setError(reason instanceof Error ? t(reason.message) : t("Could not update membership. Please try again.")); }
    finally { setBusy(false); }
  }

  const groupLabel = community?.kind === "guild" ? "Guild" : "Community";

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/communities" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"><ArrowLeft size={16} />{t("Back to communities")}</Link>

        {state === "loading" && <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">{t("Loading…")}</p>}
        {state === "missing" && <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"><h1 className="text-xl font-semibold">{t("Group not found")}</h1><Link href="/communities" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold">{t("Back to communities")}</Link></div>}
        {state === "error" && <p role="alert" className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 text-sm text-rose-300">{t("Could not load this group. Try again.")} <button type="button" onClick={() => { setState("loading"); void loadCommunity(); }} className="ml-2 underline">{t("Retry")}</button></p>}

        {state === "ready" && community && <div className="space-y-5">
          <header className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">{t(groupLabel)}</p>
                <h1 className="mt-2 break-words text-2xl font-bold tracking-tight sm:text-3xl">{community.name}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-blue-300"><Gamepad2 size={14} />{community.game}</span>
                  {community.kind === "guild" && community.region && <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 px-3 py-1 text-zinc-300"><MapPin size={14} />{community.region}</span>}
                  {community.kind === "guild" && <span className={`rounded-full px-3 py-1 text-xs font-medium ${community.recruiting ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>{t(community.recruiting ? "Recruiting" : "Not recruiting")}</span>}
                </div>
              </div>
              {community.isOwner && <button type="button" onClick={openEditor} className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"><Pencil size={15} />{t("Edit group")}</button>}
            </div>
            <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">{community.description || t("No description yet.")}</p>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
              <span className="inline-flex items-center gap-2 text-sm text-zinc-400"><UsersRound size={16} />{community.memberCount} {t("members")}</span>
              {community.isOwner ? <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-300"><Crown size={15} />{t("You are the owner")}</span>
                : community.isMember ? <button type="button" disabled={busy} onClick={() => void updateMembership()} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 disabled:opacity-50">{busy ? t("Please wait…") : t("Leave group")}</button>
                : community.kind === "guild" && !community.recruiting ? <span className="text-sm text-zinc-500">{t("Recruiting is closed")}</span>
                : session?.user ? <button type="button" disabled={busy} onClick={() => void updateMembership()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">{busy ? t("Please wait…") : t("Join group")}</button>
                : <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">{t("Sign in")}</Link>}
            </div>
          </header>

          {editing && <form onSubmit={saveDetails} className="rounded-2xl border border-blue-500/30 bg-zinc-900/70 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-semibold">{t("Edit group details")}</h2><button type="button" aria-label={t("Close")} onClick={() => setEditing(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"><X size={17} /></button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-zinc-400">{t("Group name")}<input required minLength={3} maxLength={60} value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></label>
              <label className="text-xs font-medium text-zinc-400">{t("Main game")}<select value={game} onChange={(event) => setGame(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">{games.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></label>
              {community.kind === "guild" && <>
                <label className="text-xs font-medium text-zinc-400">{t("Server or region")}<input maxLength={80} value={region} onChange={(event) => setRegion(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></label>
                <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-300"><input type="checkbox" checked={recruiting} onChange={(event) => setRecruiting(event.target.checked)} className="h-4 w-4 accent-blue-500" />{t("Recruiting members")}</label>
              </>}
            </div>
            <label className="mt-3 block text-xs font-medium text-zinc-400">{t("Group description")}<textarea maxLength={500} rows={4} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></label>
            {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
            <div className="mt-4 flex flex-wrap justify-end gap-2"><button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 hover:border-zinc-500">{t("Cancel")}</button><button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"><Save size={15} />{busy ? t("Saving…") : t("Save changes")}</button></div>
          </form>}

          {error && !editing && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">{error}</p>}

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold">{t("Members")}</h2><span className="text-xs text-zinc-500">{members.length}</span></div>
            <div className="divide-y divide-zinc-800">
              {members.map((member) => <div key={member.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800"><Image src={member.avatar} alt="" fill unoptimized className="object-cover" /></span>
                <span className="min-w-0 flex-1">{member.hasProfile ? <Link href={`/players/${encodeURIComponent(member.id)}`} className="block truncate text-sm font-medium text-white hover:text-blue-300">{member.name}</Link> : <span className="block truncate text-sm font-medium text-white">{member.name}</span>}<span className="mt-0.5 block text-xs text-zinc-500">{member.role === "owner" ? t(community.kind === "guild" ? "Guild leader" : "Owner") : t("Member")}</span></span>
                {member.role === "owner" && <Crown size={15} className="shrink-0 text-amber-300" aria-label={t("Group owner")} />}
              </div>)}
            </div>
          </section>
        </div>}
      </section>
      <Footer />
    </main>
  );
}

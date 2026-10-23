"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Crown, Gamepad2, Plus, Search, UsersRound, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { games } from "@/data/games";
import { authClient } from "@/lib/auth-client";
import { useLanguage } from "@/lib/i18n";

type Community = {
  id: string; kind: "community" | "guild"; name: string; game: string; region: string; description: string; recruiting: number; createdAt: string;
  ownerId: string; ownerName: string; ownerAvatar: string; memberCount: number;
  isMember: boolean; isOwner: boolean;
};

export default function CommunitiesPage() {
  const { t } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeKind, setActiveKind] = useState<"community" | "guild">("community");
  const [query, setQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("All");
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [game, setGame] = useState(games[1] ?? "World of Warcraft");
  const [region, setRegion] = useState("");
  const [recruiting, setRecruiting] = useState(true);
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const loadCommunities = useCallback(async () => {
    try {
      const response = await fetch("/api/communities", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const result = await response.json() as { communities: Community[] };
      setCommunities(result.communities);
    } catch { setError(t("Could not load communities. Try again.")); }
  }, [t]);

  useEffect(() => { void loadCommunities(); }, [loadCommunities]);

  const visibleCommunities = useMemo(() => communities.filter((community) =>
    community.kind === activeKind &&
    (selectedGame === "All" || community.game === selectedGame) &&
    `${community.name} ${community.game} ${community.region} ${community.description} ${community.ownerName}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [communities, activeKind, query, selectedGame]);

  async function createCommunity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create", kind: activeKind, name, game, region, recruiting, description }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error === "not_signed_in" ? "Sign in to create a community." : "Could not create the community. Check the name and try again.");
      setName(""); setRegion(""); setDescription(""); setFormOpen(false);
      await loadCommunities();
    } catch (reason) { setError(reason instanceof Error ? t(reason.message) : t("Could not create the community. Check the name and try again.")); }
    finally { setBusy(false); }
  }

  async function updateMembership(community: Community) {
    if (!session?.user) { setError(t("Sign in to join a community.")); return; }
    setBusyId(community.id); setError("");
    try {
      const response = await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: community.isMember ? "leave" : "join", communityId: community.id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error === "owner_cannot_leave" ? "The community owner cannot leave their own community." : "Could not update membership. Please try again.");
      await loadCommunities();
    } catch (reason) { setError(reason instanceof Error ? t(reason.message) : t("Could not update membership. Please try again.")); }
    finally { setBusyId(""); }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-12">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">{t("Find your people")}</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t(activeKind === "guild" ? "Guilds" : "Communities")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">{t("Find a group of players who share your games and goals.")}</p>
          </div>
          {session?.user && <button type="button" onClick={() => setFormOpen((value) => !value)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"><Plus size={16} />{t(activeKind === "guild" ? "Create a guild" : "Create community")}</button>}
        </div>

        <div className="mb-5 inline-flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1" role="tablist" aria-label={t("Group type")}>
          {(["community", "guild"] as const).map((kind) => <button key={kind} type="button" role="tab" aria-selected={activeKind === kind} onClick={() => { setActiveKind(kind); setFormOpen(false); }} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${activeKind === kind ? "bg-blue-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}>{t(kind === "community" ? "Communities" : "Guilds")}</button>)}
        </div>

        {formOpen && <form onSubmit={createCommunity} className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{t(activeKind === "guild" ? "Create a guild" : "Start a community")}</h2><button type="button" aria-label={t("Close")} onClick={() => setFormOpen(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"><X size={17} /></button></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-zinc-400">{t(activeKind === "guild" ? "Guild name" : "Community name")}<input value={name} onChange={(event) => setName(event.target.value)} required minLength={3} maxLength={60} placeholder={t(activeKind === "guild" ? "Example: Azeroth Vanguard" : "Example: WoW Mythic+ EU")} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" /></label>
            <label className="text-xs font-medium text-zinc-400">{t("Main game")}<select value={game} onChange={(event) => setGame(event.target.value)} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">{games.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select></label>
          </div>
          {activeKind === "guild" && <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-zinc-400">{t("Server or region")} <span className="font-normal text-zinc-600">· {t("optional")}</span><input value={region} onChange={(event) => setRegion(event.target.value)} maxLength={80} placeholder={t("e.g. EU, Stormrage") } className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" /></label>
            <label className="flex cursor-pointer items-center gap-2 self-end rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-300"><input type="checkbox" checked={recruiting} onChange={(event) => setRecruiting(event.target.checked)} className="h-4 w-4 accent-blue-500" />{t("Recruiting members")}</label>
          </div>}
          <label className="mt-3 block text-xs font-medium text-zinc-400">{t("Description")} <span className="font-normal text-zinc-600">· {t("optional")}</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} rows={3} placeholder={t("What does your community play or focus on?")} className="mt-1.5 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" /></label>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="text-xs text-zinc-500">{t(activeKind === "guild" ? "You’ll be the guild leader and first member." : "You’ll be the community owner and first member.")}</span><button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">{busy ? t("Creating…") : t(activeKind === "guild" ? "Create guild" : "Create community")}</button></div>
        </form>}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative min-w-0 flex-1"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("Search communities or games…")} className="w-full rounded-lg border border-zinc-800 bg-zinc-900/70 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" /></label>
          <select aria-label={t("Filter by game")} value={selectedGame} onChange={(event) => setSelectedGame(event.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-blue-500"><option value="All">{t("All games")}</option>{games.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}</select>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">{error}<button onClick={() => setError("")} className="ml-2 underline">{t("Dismiss")}</button></p>}
        {visibleCommunities.length === 0 ? <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-5 py-12 text-center">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><UsersRound size={20} /></span>
          <h2 className="mt-4 font-semibold text-white">{query || selectedGame !== "All" ? t(activeKind === "guild" ? "No guilds match" : "No communities match") : t(activeKind === "guild" ? "No guilds yet" : "No communities yet")}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{query || selectedGame !== "All" ? t("Try another search or game filter.") : t(activeKind === "guild" ? "Create the first guild and start recruiting players." : "Create the first community and find players who share your interests.")}</p>
          {!session?.user && !isPending && <Link href="/login" className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">{t("Sign in to create a community")}</Link>}
        </div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCommunities.map((community) => <article key={community.id} className="flex min-h-52 flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-blue-500/40 hover:bg-zinc-900">
            <div className="mb-3 flex flex-wrap items-start justify-between gap-2"><span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300"><Gamepad2 size={13} />{community.game}</span><span className="flex items-center gap-2">{community.kind === "guild" && <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${community.recruiting ? "bg-emerald-500/10 text-emerald-300" : "bg-zinc-800 text-zinc-400"}`}>{t(community.recruiting ? "Recruiting" : "Not recruiting")}</span>}{community.isOwner && <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300"><Crown size={12} />{t(community.kind === "guild" ? "Guild leader" : "Owner")}</span>}</span></div>
            <h2 className="text-base font-semibold text-white">{community.name}</h2>
            {community.kind === "guild" && community.region && <p className="mt-1 text-xs text-zinc-500">{t("Server / region")}: {community.region}</p>}
            <p className="mt-1 line-clamp-3 flex-1 whitespace-pre-wrap text-sm leading-5 text-zinc-400">{community.description || t("No description yet.")}</p>
            <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
              <div className="flex min-w-0 items-center gap-2"><span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800"><Image src={community.ownerAvatar} alt="" fill unoptimized className="object-cover" /></span><span className="min-w-0"><span className="block max-w-24 truncate text-xs font-medium text-zinc-300">{community.ownerName}</span><span className="flex items-center gap-1 text-[10px] text-zinc-500"><UsersRound size={11} />{community.memberCount} {t("members")}</span></span></div>
              {community.isOwner ? <span className="text-xs font-medium text-emerald-300">{t("Joined")}</span> : community.kind === "guild" && !community.recruiting && !community.isMember ? <span className="text-xs text-zinc-500">{t("Not recruiting")}</span> : <button type="button" disabled={busyId === community.id} onClick={() => void updateMembership(community)} className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:opacity-50 ${community.isMember ? "border border-zinc-700 text-zinc-300 hover:border-zinc-500" : "bg-blue-600 text-white hover:bg-blue-500"}`}>{community.isMember ? t("Leave") : t("Join")}<ArrowUpRight size={13} /></button>}
            </div>
          </article>)}
        </div>}
      </section>
      <Footer />
    </main>
  );
}

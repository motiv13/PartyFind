"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Compass, LoaderCircle, RefreshCw, UsersRound } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeedComposer from "@/components/feed/FeedComposer";
import FeedPostCard from "@/components/feed/FeedPostCard";
import { authClient } from "@/lib/auth-client";
import type { FeedPost } from "@/types/feed";
import { useLanguage } from "@/lib/i18n";

export default function FeedPage() {
  const { t } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("/api/feed", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const result = await response.json() as { posts: FeedPost[] };
      setPosts(result.posts);
      setError("");
    } catch {
      setError("Could not load the feed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(true);
    const interval = window.setInterval(() => void loadPosts(), 30_000);
    const onFocus = () => void loadPosts();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadPosts]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">{t("PartyFind community")}</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{t("LFG Feed")}</h1>
                <p className="mt-1 text-sm text-zinc-500">{t("Group up for raids, ranked, and more.")}</p>
              </div>
              <button type="button" onClick={() => void loadPosts(true)} aria-label="Refresh feed" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-800 text-zinc-400 transition hover:border-zinc-600 hover:text-white"><RefreshCw size={16} /></button>
            </div>

            {!isPending && session?.user ? <FeedComposer onPublished={() => void loadPosts(true)} /> : !isPending ? (
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
              <p className="text-sm text-zinc-300">{t("Sign in to post a group announcement.")}</p>
                <Link href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500">{t("Sign in")}</Link>
              </div>
            ) : null}

            <div className="space-y-4">
              {loading && <div className="flex items-center justify-center gap-2 py-12 text-sm text-zinc-500"><LoaderCircle size={17} className="animate-spin" />{t("Loading announcements…")}</div>}
              {!loading && error && <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-sm text-rose-300">{error}<button type="button" onClick={() => void loadPosts(true)} className="ml-2 underline underline-offset-2">Retry</button></div>}
              {!loading && !error && posts.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/30 px-5 py-12 text-center">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><Compass size={20} /></div>
                <h2 className="mt-4 font-semibold text-white">{t("The feed is quiet")}</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{t("Post the first announcement and find players for your next group.")}</p>
              </div>}
              {!loading && posts.map((post) => <FeedPostCard key={post.id} post={post} currentUserId={session?.user.id} onChange={() => void loadPosts()} />)}
            </div>
          </div>

          <aside className="hidden space-y-3 lg:sticky lg:top-24 lg:block">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white"><UsersRound size={16} className="text-blue-400" />{t("Make it easy to join")}</div>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-zinc-500">
                <li>{t("Choose the game and activity.")}</li>
                <li>{t("Add the time and group details.")}</li>
                <li>{t("Attach a poster if you have one.")}</li>
              </ul>
            </div>
            <p className="px-1 text-[11px] leading-5 text-zinc-600">{t("Announcements are shown newest first. You can remove your own posts at any time.")}</p>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CalendarClock, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import type { FeedComment, FeedPost } from "@/types/feed";
import { useLanguage } from "@/lib/i18n";

function formatDate(value: string, language: "en" | "uk") {
  const date = new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(language === "uk" ? "uk-UA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function FeedPostCard({ post, currentUserId, onChange }: { post: FeedPost; currentUserId?: string; onChange: () => void }) {
  const { t, language } = useLanguage();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadComments() {
    const response = await fetch(`/api/feed/${post.id}/comments`);
    if (!response.ok) throw new Error("Could not load comments.");
    const result = await response.json() as { comments: FeedComment[] };
    setComments(result.comments);
    setCommentsLoaded(true);
  }

  async function toggleComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    setError("");
    if (next && !commentsLoaded) {
      try { await loadComments(); } catch { setError("Could not load comments."); }
    }
  }

  async function toggleLike() {
    if (!currentUserId) {
      setError("Sign in to like an announcement.");
      return;
    }
    try {
      const response = await fetch(`/api/feed/${post.id}/like`, { method: "POST" });
      if (response.status === 401) { setError("Sign in to like an announcement."); return; }
      if (!response.ok) throw new Error();
      onChange();
    } catch { setError("Could not update your reaction."); }
  }

  async function addComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentUserId) { setError("Sign in to comment."); return; }
    if (!commentText.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/feed/${post.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: commentText }),
      });
      if (response.status === 401) { setError("Sign in to comment."); return; }
      if (!response.ok) throw new Error();
      setCommentText("");
      await loadComments();
      onChange();
    } catch { setError("Could not add your comment."); }
    finally { setBusy(false); }
  }

  async function deletePost() {
    if (!window.confirm("Delete this announcement?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/feed/${post.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      onChange();
    } catch { setError("Could not delete this announcement."); }
    finally { setBusy(false); }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70">
      <header className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <Link href={`/players/${post.authorId}`} className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
          <Image src={post.authorAvatar} alt="" fill unoptimized className="object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/players/${post.authorId}`} className="truncate text-sm font-semibold text-white hover:text-blue-300">{post.authorName}</Link>
      <p className="truncate text-xs text-zinc-500">{formatDate(post.createdAt, language)}</p>
        </div>
        {currentUserId === post.authorId && <button type="button" onClick={() => void deletePost()} disabled={busy} aria-label={t("Delete announcement")} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-rose-300 disabled:opacity-50"><Trash2 size={16} /></button>}
      </header>

      <div className="px-4 pb-3 sm:px-5">
        <div className="mb-2 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-300">{post.game}</span>
          <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-medium text-zinc-300">{post.activity}</span>
        </div>
        <h2 className="text-base font-semibold leading-snug text-white">{post.title}</h2>
        {post.body && <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{post.body}</p>}
        {post.eventAt && <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300"><CalendarClock size={14} />{formatDate(post.eventAt, language)}</p>}
      </div>

      {post.imageUrl && <div className="relative aspect-[16/9] max-h-[440px] w-full bg-zinc-950">
        <Image src={post.imageUrl} alt={`${post.title} poster`} fill unoptimized sizes="(max-width: 768px) 100vw, 760px" className="object-contain" />
      </div>}

      <div className="flex items-center gap-5 border-t border-zinc-800 px-4 py-3 sm:px-5">
        <button type="button" onClick={() => void toggleLike()} aria-pressed={post.likedByMe} className={`inline-flex items-center gap-1.5 text-sm transition ${post.likedByMe ? "text-rose-400" : "text-zinc-400 hover:text-rose-300"}`}>
          <Heart size={17} fill={post.likedByMe ? "currentColor" : "none"} />{post.likeCount}
        </button>
        <button type="button" onClick={() => void toggleComments()} aria-expanded={commentsOpen} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white">
          <MessageCircle size={17} />{post.commentCount} <span className="hidden sm:inline">{t("comments")}</span>
        </button>
        <Link href={`/players/${post.authorId}`} className="ml-auto text-xs font-medium text-blue-300 transition hover:text-blue-200">{t("View organizer")}</Link>
      </div>

      {commentsOpen && <section className="border-t border-zinc-800 bg-zinc-950/40 px-4 py-3 sm:px-5">
        <div className="max-h-56 space-y-3 overflow-y-auto">
          {comments.map((comment) => <div key={comment.id} className="flex gap-2.5">
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-zinc-800"><Image src={comment.authorAvatar} alt="" fill unoptimized className="object-cover" /></div>
            <p className="min-w-0 flex-1 text-sm leading-5 text-zinc-300"><Link href={`/players/${comment.authorId}`} className="mr-1 font-semibold text-white hover:text-blue-300">{comment.authorName}</Link>{comment.body}<span className="ml-2 whitespace-nowrap text-[10px] text-zinc-600">{formatDate(comment.createdAt, language)}</span></p>
          </div>)}
          {commentsLoaded && comments.length === 0 && <p className="text-xs text-zinc-500">{t("No comments yet. Start the conversation.")}</p>}
        </div>
        <form onSubmit={addComment} className="mt-3 flex items-center gap-2">
          <input value={commentText} onChange={(event) => setCommentText(event.target.value)} maxLength={500} placeholder={currentUserId ? t("Write a comment…") : t("Sign in to comment")} disabled={!currentUserId || busy} className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500 disabled:opacity-60" />
          <button type="submit" disabled={!currentUserId || busy || !commentText.trim()} aria-label="Send comment" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} /></button>
        </form>
      </section>}
      {error && <p role="alert" className="border-t border-zinc-800 px-4 py-2 text-xs text-rose-400 sm:px-5">{error}</p>}
    </article>
  );
}

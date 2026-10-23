"use client";

import Image from "next/image";
import { ImagePlus, Plus, Send, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { games } from "@/data/games";
import { useLanguage } from "@/lib/i18n";

const activities = ["Raid", "Mythic+", "Dungeon", "Ranked", "Casual group", "Looking for group", "Other"];

export default function FeedComposer({ onPublished }: { onPublished: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (!image) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    if (image) formData.set("image", image);
    try {
      const response = await fetch("/api/feed", { method: "POST", body: formData });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setError(result.error === "image_too_large" ? "Image must be 5 MB or smaller." : result.error === "unsupported_image" ? "Use a JPEG, PNG, or WebP image." : result.error === "not_signed_in" ? "Sign in to publish an announcement." : "Could not publish this announcement.");
        return;
      }
      form.reset();
      setImage(null);
      setOpen(false);
      onPublished();
    } catch {
      setError("Could not connect to PartyFind. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3 sm:p-4">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 rounded-xl px-1 py-1 text-left">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><ImagePlus size={18} /></span>
          <span className="min-w-0"><span className="block truncate text-sm font-semibold text-white">{t("Create announcement")}</span><span className="mt-0.5 block truncate text-xs text-zinc-500">{t("Find teammates for your next activity.")}</span></span>
        </span>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-zinc-800 text-zinc-400 transition ${open ? "rotate-45" : ""}`}><Plus size={17} /></span>
      </button>

      {open && <form onSubmit={publish} className="mt-4 border-t border-zinc-800 pt-4">

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-zinc-400">{t("Game")}
          <select name="game" defaultValue={games[1]} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">
            {games.filter((game) => game !== "All").map((game) => <option key={game} value={game}>{game}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-zinc-400">{t("Activity")}
          <select name="activity" defaultValue="Raid" className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500">
            {activities.map((activity) => <option key={activity} value={activity}>{activity}</option>)}
          </select>
        </label>
      </div>

      <label className="mt-3 block text-xs font-medium text-zinc-400">{t("Headline")}
        <input name="title" required maxLength={80} placeholder={t("10/25M raid team looking for a healer")} className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" />
      </label>
      <label className="mt-3 block text-xs font-medium text-zinc-400">{t("Details")} <span className="font-normal text-zinc-600">· {t("optional")}</span>
        <textarea name="body" maxLength={1000} rows={3} placeholder="Tell players about the group, requirements, and how to join…" className="mt-1.5 w-full resize-y rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500" />
      </label>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-52 flex-1 text-xs font-medium text-zinc-400">{t("When")} <span className="font-normal text-zinc-600">· {t("optional")}</span>
          <input name="eventAt" type="datetime-local" className="mt-1.5 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-zinc-300 outline-none focus:border-blue-500" />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 px-3 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white">
          <ImagePlus size={16} />{image ? t("Change poster") : t("Add poster")}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
          <Send size={15} />{busy ? t("Publishing…") : t("Publish")}
        </button>
      </div>

      {image && <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-950/70 p-2">
        {preview && <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-900"><Image src={preview} alt={t("Poster preview")} fill unoptimized className="object-cover" /></div>}
        <span className="min-w-0 flex-1 truncate text-xs text-zinc-400">{image.name}</span>
        <button type="button" onClick={() => setImage(null)} aria-label={t("Remove poster")} className="rounded-md p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white"><X size={15} /></button>
      </div>}
      {error && <p role="alert" className="mt-3 text-sm text-rose-400">{error}</p>}
      <p className="mt-3 text-[11px] text-zinc-600">{t("Poster: JPEG, PNG or WebP · up to 5 MB")}</p>
      </form>}
    </div>
  );
}

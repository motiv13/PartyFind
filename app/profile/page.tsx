"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ChevronDown, CircleHelp, Save, UserRound, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { players } from "@/data/player";
import { games } from "@/data/games";
import { countries, languages, lookingForOptions } from "@/data/profile-options";
import type { Player } from "@/types/player";
import MultiOptionPicker from "@/components/profile/MultiOptionPicker";
import { useLanguage } from "@/lib/i18n";

const initialProfile = players[0];

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeTags(values: string[]) {
  const tags: string[] = [];
  const seen = new Set<string>();
  for (const item of values) {
    const tag = item.trim().slice(0, 24);
    const key = tag.toLocaleLowerCase();
    if (tag && !seen.has(key) && tags.length < 12) {
      tags.push(tag);
      seen.add(key);
    }
  }
  return tags;
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Player>(initialProfile);
  const [saved, setSaved] = useState(false);
  const [authState, setAuthState] = useState<"loading" | "signed-out" | "signed-in" | "error">("loading");
  const [message, setMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [favoriteGamesText, setFavoriteGamesText] = useState("");
  const [tagInput, setTagInput] = useState("");
  const avatarInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (response) => {
        if (response.status === 401) {
          setAuthState("signed-out");
          return;
        }
        if (!response.ok) throw new Error("Could not load your profile.");
        const result = await response.json() as { profile: Player };
        setProfile(result.profile);
        setFavoriteGamesText(result.profile.favoriteGames.join(", "));
        setAuthState("signed-in");
      })
      .catch(() => {
        setMessage("Could not connect to PartyFind. Please try again.");
        setAuthState("error");
      });
  }, []);

  function update<K extends keyof Player>(key: K, value: Player[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function addTag(value: string) {
    const tag = value.trim().replace(/,$/, "").trim().slice(0, 24);
    if (!tag) return;
    const currentTags = profile.tags ?? [];
    if (currentTags.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) {
      setTagInput("");
      return;
    }
    if (currentTags.length >= 12) {
      setMessage("You can add up to 12 tags.");
      return;
    }
    update("tags", [...currentTags, tag]);
    setTagInput("");
    setMessage("");
  }

  function handleTagKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(tagInput);
    }
  }

  async function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setMessage("Choose an image smaller than 3 MB.");
      return;
    }
    setUploadingAvatar(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("avatar", file);
      const response = await fetch("/api/profile/avatar", { method: "POST", body: form });
      const result = await response.json() as { avatar?: string; error?: string };
      if (!response.ok || !result.avatar) {
        setMessage(result.error === "unsupported_image" ? "Use a JPEG, PNG, or WebP image." : "Could not upload this image. Please try again.");
        return;
      }
      update("avatar", result.avatar);
    } catch {
      setMessage("Could not connect to PartyFind. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const profileToSave = {
      ...profile,
      favoriteGames: splitList(favoriteGamesText),
      tags: normalizeTags([...(profile.tags ?? []), tagInput]),
    };
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileToSave),
    });
    const result = await response.json() as { profile?: Player; error?: string };
    if (!response.ok || !result.profile) {
      setMessage(result.error === "required_fields_missing" ? "Please choose a game and upload an avatar." : "Could not save your profile.");
      setSaved(false);
      return;
    }
    setProfile(result.profile);
    setFavoriteGamesText(result.profile.favoriteGames.join(", "));
    setTagInput("");
    setSaved(true);
    window.dispatchEvent(new Event("partyfind:profile-updated"));
  }

  const fieldClass = "mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";
  const labelClass = "text-sm font-medium text-zinc-200";
  const countryOptions = [...new Set([...countries, ...(profile.country ? [profile.country] : [])])].sort();
  const languageOptions = [...new Set([...languages, ...(profile.languages ?? [])])].sort();
  const lookingForChoices = [...new Set([...lookingForOptions, ...(profile.lookingFor ?? [])])].sort();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-9 sm:px-6 sm:py-10">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-400">{t("Player settings")}</p>
            <h1 className="text-3xl font-bold tracking-tight">{t("Edit your profile")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">{t("Tell other players what you play and who you want to team up with.")}</p>
          </div>
          <Link href={`/players/${profile.id}`} className="text-sm font-medium text-zinc-300 transition hover:text-white">
            {t("Preview public profile")} <span aria-hidden="true">↗</span>
          </Link>
        </div>

        {authState === "loading" && <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-400">{t("Loading your profile…")}</div>}

        {(authState === "signed-out" || authState === "error") && (
          <div className="max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
            <h2 className="text-xl font-semibold">{authState === "signed-out" ? t("Sign in to edit your profile") : t("Profile unavailable")}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{authState === "signed-out" ? "Your profile will be linked to your account and saved in the PartyFind database." : message}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login" className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-zinc-500">{t("Sign in")}</Link>
              <Link href="/register" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">{t("Create account")}</Link>
            </div>
          </div>
        )}

        {authState === "signed-in" && <div className="grid gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-400"><UserRound size={19} /></span>
                <div><h2 className="font-semibold">{t("Basics")}</h2><p className="mt-1 text-sm text-zinc-500">{t("The details players see first.")}</p></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>{t("Display name")}<input required maxLength={24} value={profile.name} onChange={(event) => update("name", event.target.value)} className={fieldClass} /></label>
                <label className={labelClass}>{t("Country")} <span className="font-normal text-zinc-500">{t("(optional)")}</span><span className="relative mt-2 block"><select value={profile.country} onChange={(event) => update("country", event.target.value)} className={`${fieldClass} appearance-none pr-10`}><option value="">{t("No country selected")}</option>{countryOptions.map((country) => <option key={country} value={country}>{country}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" /></span></label>
                <label className={labelClass}>{t("Main game")}<span className="relative mt-2 block"><select value={profile.game} onChange={(event) => update("game", event.target.value)} className={`${fieldClass} mt-0 appearance-none pr-10`}>{games.filter((game) => game !== "All").map((game) => <option key={game}>{game}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" /></span></label>
                <label className={labelClass}>{t("Role / class")} <span className="font-normal text-zinc-500">{t("(optional)")}</span><input maxLength={32} value={profile.role} onChange={(event) => update("role", event.target.value)} className={fieldClass} /></label>
                <label className={labelClass}>{t("Rank or item level")}<input maxLength={32} value={profile.rank ?? profile.ilvl ?? ""} onChange={(event) => update("rank", event.target.value)} placeholder={t("e.g. Diamond, 720 ilvl")} className={fieldClass} /></label>
                <label className={labelClass}>{t("Discord username")}<input maxLength={40} value={profile.discord} onChange={(event) => update("discord", event.target.value)} placeholder={t("yourname")} className={fieldClass} /></label>
                <div className="sm:col-span-2">
                  <span className={labelClass}>{t("Profile photo")}</span>
                  <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                      {profile.avatar && <Image src={profile.avatar} alt="Profile photo preview" fill unoptimized className="object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-zinc-300">{t("JPEG, PNG or WebP · up to 3 MB")}</p>
                      <p className="mt-1 text-xs text-zinc-500">{t("Your photo will appear on your public player profile.")}</p>
                    </div>
                    <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatarChange} className="sr-only" aria-label={t("Choose profile photo")} />
                    <button type="button" onClick={() => avatarInput.current?.click()} disabled={uploadingAvatar} className="rounded-xl border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-zinc-500 disabled:cursor-wait disabled:opacity-60">
                      {uploadingAvatar ? t("Uploading…") : t("Choose photo")}
                    </button>
                  </div>
                </div>
                <label className={`${labelClass} sm:col-span-2`}>{t("About you")}<textarea rows={4} maxLength={280} value={profile.bio} onChange={(event) => update("bio", event.target.value)} placeholder={t("Tell teammates about your play style and schedule...")} className={`${fieldClass} resize-y`} /><span className="mt-1 block text-right text-xs font-normal text-zinc-500">{profile.bio.length}/280</span></label>
              </div>
            </section>

            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-8">
              <div className="mb-5"><h2 className="font-semibold">{t("Finding your team")}</h2><p className="mt-1 text-sm text-zinc-500">{t("Choose languages and activities from the lists so others can find you with the same filters.")}</p></div>
              <div className="grid gap-4">
                <MultiOptionPicker id="profile-languages" label={t("Languages")} selected={profile.languages} options={languageOptions} placeholder={t("Choose a language")} onAdd={(language) => update("languages", [...profile.languages, language])} onRemove={(language) => update("languages", profile.languages.filter((item) => item !== language))} />
                <label className={labelClass}>{t("Favorite games")}<input value={favoriteGamesText} onChange={(event) => { setFavoriteGamesText(event.target.value); setSaved(false); }} placeholder={t("Valorant, Apex Legends")} className={fieldClass} /></label>
                <MultiOptionPicker id="profile-looking-for" label={t("Looking for")} selected={profile.lookingFor} options={lookingForChoices} placeholder={t("Choose what you are looking for")} onAdd={(activity) => update("lookingFor", [...profile.lookingFor, activity])} onRemove={(activity) => update("lookingFor", profile.lookingFor.filter((item) => item !== activity))} />
                <div className={labelClass}>
                  <label htmlFor="profile-tags">{t("Tags for search")}</label>
                  <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                    {(profile.tags ?? []).map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 py-1 pl-3 pr-1 text-xs font-medium text-purple-300">
                        #{tag}
                        <button type="button" onClick={() => update("tags", (profile.tags ?? []).filter((item) => item !== tag))} aria-label={`Remove ${tag} tag`} className="rounded-full p-1 transition hover:bg-purple-500/20 hover:text-white"><X size={13} /></button>
                      </span>
                    ))}
                    <input
                      id="profile-tags"
                      value={tagInput}
                      onChange={(event) => setTagInput(event.target.value)}
                      onKeyDown={handleTagKeyDown}
                      onBlur={() => addTag(tagInput)}
                      disabled={(profile.tags ?? []).length >= 12}
                      placeholder={(profile.tags ?? []).length ? t("Add another…") : t("Type a tag and press Enter")}
                      className="min-w-40 flex-1 bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed"
                    />
                  </div>
                  <span className="mt-2 block text-xs font-normal text-zinc-500">{t("Press Enter or comma after each tag. Up to 12 tags; players can search for them.")}</span>
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300">
                  <input type="checkbox" checked={profile.voice} onChange={(event) => update("voice", event.target.checked)} className="h-4 w-4 accent-blue-500" />
                  {t("I can use voice chat")}
                </label>
              </div>
            </section>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              {message && <p role="alert" className="text-sm text-rose-400">{message}</p>}
              <button type="submit" disabled={uploadingAvatar} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60">
                {saved ? <Check size={17} /> : <Save size={17} />}{saved ? t("Saved") : t("Save changes")}
              </button>
            </div>
          </form>

          <aside className="h-fit rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 lg:sticky lg:top-28">
            <h2 className="font-semibold">{t("Profile preview")}</h2>
            <div className="mt-5 flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-700 bg-zinc-800">
                {profile.avatar && <Image src={profile.avatar} alt="" fill unoptimized className="object-cover" />}
              </div>
              <div className="min-w-0"><p className="truncate font-semibold">{profile.name || "Your name"}</p><p className="mt-1 truncate text-sm text-zinc-400">{[profile.role, profile.game].filter(Boolean).join(" · ")}</p></div>
            </div>
            <p className="mt-5 line-clamp-4 min-h-20 text-sm leading-6 text-zinc-400">{profile.bio || "Your introduction will appear here."}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.lookingFor.slice(0, 4).map((item) => <span key={item} className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">{item}</span>)}
            </div>
            {(profile.tags ?? []).length > 0 && <div className="mt-4 flex flex-wrap gap-2">{(profile.tags ?? []).slice(0, 4).map((tag) => <span key={tag} className="rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">#{tag}</span>)}</div>}
            <div className="mt-6 flex gap-2 rounded-xl border border-blue-500/15 bg-blue-500/5 p-3 text-xs leading-5 text-zinc-400"><CircleHelp size={16} className="mt-0.5 shrink-0 text-blue-400" />Uploaded photos are stored on this PartyFind server. For hosted deployments, connect persistent file storage.</div>
          </aside>
        </div>}
      </div>
      <Footer />
    </main>
  );
}

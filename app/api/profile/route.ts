import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getOrCreateProfile, saveProfile } from "@/lib/profile-store";
import type { Player } from "@/types/player";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  return Response.json({ profile: getOrCreateProfile(user.id, user.name) });
}

export async function PUT(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: Partial<Player>;
  try {
    body = await request.json() as Partial<Player>;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const text = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";
  const list = (value: unknown) =>
    Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim().slice(0, 40)).filter(Boolean).slice(0, 12)
      : [];
  const tags: string[] = [];
  const seenTags = new Set<string>();
  if (Array.isArray(body.tags)) {
    for (const value of body.tags) {
      if (typeof value !== "string") continue;
      const tag = value.trim().slice(0, 24);
      const key = tag.toLocaleLowerCase();
      if (tag && !seenTags.has(key) && tags.length < 12) {
        tags.push(tag);
        seenTags.add(key);
      }
    }
  }

  const profile: Player = {
    id: user.id,
    name: text(body.name, 24) || user.name,
    avatar: text(body.avatar, 500),
    game: text(body.game, 60),
    role: text(body.role, 32),
    country: text(body.country, 40),
    online: true,
    voice: Boolean(body.voice),
    rank: text(body.rank, 32) || undefined,
    bio: text(body.bio, 280),
    discord: text(body.discord, 40),
    languages: list(body.languages),
    favoriteGames: list(body.favoriteGames),
    lookingFor: list(body.lookingFor),
    tags,
  };

  if (!profile.game || !profile.avatar) {
    return Response.json({ error: "required_fields_missing" }, { status: 400 });
  }
  if (!profile.avatar.startsWith("https://") && !/^\/api\/profile\/avatar\/[a-f0-9-]+\.(jpg|png|webp)$/.test(profile.avatar)) {
    return Response.json({ error: "invalid_avatar" }, { status: 400 });
  }

  return Response.json({ profile: saveProfile(user.id, profile) });
}

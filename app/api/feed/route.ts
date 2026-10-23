import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createFeedPost, listFeedPosts } from "@/lib/feed-store";
import { getOrCreateProfile } from "@/lib/profile-store";
import { games } from "@/data/games";

export const runtime = "nodejs";

const activities = ["Raid", "Mythic+", "Dungeon", "Ranked", "Casual group", "Looking for group", "Other"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const formats = [
  { mime: "image/jpeg", extension: "jpg", signature: (bytes: Buffer) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { mime: "image/png", extension: "png", signature: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/webp", extension: "webp", signature: (bytes: Buffer) => bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
];

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  return Response.json({ posts: listFeedPosts(session?.user.id ?? null) });
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const text = (key: string, max: number) => {
    const value = form.get(key);
    return typeof value === "string" ? value.trim().slice(0, max) : "";
  };
  const game = text("game", 60);
  const activity = text("activity", 32);
  const title = text("title", 80);
  const body = text("body", 1000);
  const eventInput = text("eventAt", 64);

  if (!games.includes(game) || game === "All") return Response.json({ error: "invalid_game" }, { status: 400 });
  if (!activities.includes(activity)) return Response.json({ error: "invalid_activity" }, { status: 400 });
  if (!title) return Response.json({ error: "title_required" }, { status: 400 });

  let eventAt: string | null = null;
  if (eventInput) {
    const eventDate = new Date(eventInput);
    if (Number.isNaN(eventDate.getTime())) return Response.json({ error: "invalid_event_time" }, { status: 400 });
    eventAt = eventDate.toISOString();
  }

  let imageUrl: string | null = null;
  const file = form.get("image");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_SIZE) return Response.json({ error: "image_too_large" }, { status: 413 });
    const bytes = Buffer.from(await file.arrayBuffer());
    const format = formats.find((candidate) => candidate.mime === file.type && candidate.signature(bytes));
    if (!format) return Response.json({ error: "unsupported_image" }, { status: 415 });
    const filename = `${randomUUID()}.${format.extension}`;
    const directory = path.join(process.cwd(), "data", "feed");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), bytes, { flag: "wx" });
    imageUrl = `/api/feed/media/${filename}`;
  }

  getOrCreateProfile(session.user.id, session.user.name);
  const id = randomUUID();
  createFeedPost({ id, authorId: session.user.id, game, activity, title, body, eventAt, imageUrl });
  return Response.json({ id }, { status: 201 });
}

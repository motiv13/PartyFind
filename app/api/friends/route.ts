import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import { getFriendshipBetween, listFriendRelationships } from "@/lib/friend-store";
import { createNotification } from "@/lib/notification-store";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });
  return Response.json({ relationships: listFriendRelationships(user.id) });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: { playerId?: unknown };
  try {
    body = await request.json() as { playerId?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const playerId = typeof body.playerId === "string" ? body.playerId.trim() : "";
  if (!playerId) return Response.json({ error: "player_required" }, { status: 400 });
  if (playerId === user.id) return Response.json({ error: "cannot_add_yourself" }, { status: 400 });

  const target = database.prepare('SELECT id FROM "user" WHERE id = ?').get(playerId);
  if (!target) return Response.json({ error: "player_not_registered" }, { status: 404 });

  const existing = getFriendshipBetween(user.id, playerId);
  if (existing?.status === "accepted") return Response.json({ error: "already_friends" }, { status: 409 });
  if (existing?.status === "pending" && existing.requesterId === user.id) {
    return Response.json({ error: "request_pending" }, { status: 409 });
  }
  if (existing?.status === "pending" && existing.recipientId === user.id) {
    database.prepare("UPDATE player_friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(existing.id);
    createNotification(playerId, user.id, "friend_accepted", existing.id);
    return Response.json({ status: "accepted" });
  }

  database.prepare(`
    INSERT INTO player_friendships (id, requester_id, recipient_id, status)
    VALUES (?, ?, ?, 'pending')
  `).run(randomUUID(), user.id, playerId);
  const friendship = getFriendshipBetween(user.id, playerId);
  if (friendship) createNotification(playerId, user.id, "friend_request", friendship.id);

  return Response.json({ status: "pending" }, { status: 201 });
}

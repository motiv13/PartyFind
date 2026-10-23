import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import { listPartyInvites } from "@/lib/party-invite-store";
import { games } from "@/data/games";
import { createNotification } from "@/lib/notification-store";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });
  return Response.json({ invites: listPartyInvites(user.id) });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: { playerId?: unknown; game?: unknown; note?: unknown };
  try {
    body = await request.json() as { playerId?: unknown; game?: unknown; note?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const playerId = typeof body.playerId === "string" ? body.playerId.trim() : "";
  const game = typeof body.game === "string" ? body.game.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 280) : "";
  if (!playerId || !game) return Response.json({ error: "player_and_game_required" }, { status: 400 });
  if (playerId === user.id) return Response.json({ error: "cannot_invite_yourself" }, { status: 400 });
  if (!games.includes(game) || game === "All") return Response.json({ error: "invalid_game" }, { status: 400 });
  if (!database.prepare('SELECT id FROM "user" WHERE id = ?').get(playerId)) {
    return Response.json({ error: "player_not_registered" }, { status: 404 });
  }

  const duplicate = database.prepare(`
    SELECT id FROM party_invites
    WHERE sender_id = ? AND recipient_id = ? AND game = ? AND status = 'pending'
    LIMIT 1
  `).get(user.id, playerId, game);
  if (duplicate) return Response.json({ error: "invite_already_pending" }, { status: 409 });

  const id = randomUUID();
  database.prepare(`
    INSERT INTO party_invites (id, sender_id, recipient_id, game, note, status)
    VALUES (?, ?, ?, ?, ?, 'pending')
  `).run(id, user.id, playerId, game, note);
  createNotification(playerId, user.id, "party_invite", id);

  return Response.json({ id, status: "pending" }, { status: 201 });
}

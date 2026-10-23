import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import type { ConversationDetails } from "@/types/message";
import { createNotification } from "@/lib/notification-store";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });
  const { conversationId } = await params;

  const row = database.prepare(`
    SELECT
      other.id AS playerId,
      other.name AS name,
      other.image AS userImage,
      p.avatar AS profileAvatar,
      p.game AS game,
      p.role AS role
    FROM conversations c
    JOIN "user" other ON other.id = CASE WHEN c.user_one_id = @userId THEN c.user_two_id ELSE c.user_one_id END
    LEFT JOIN player_profiles p ON p.user_id = other.id
    WHERE c.id = @conversationId AND (c.user_one_id = @userId OR c.user_two_id = @userId)
  `).get({ userId: user.id, conversationId }) as {
    playerId: string;
    name: string;
    userImage: string | null;
    profileAvatar: string | null;
    game: string | null;
    role: string | null;
  } | undefined;
  if (!row) return Response.json({ error: "conversation_not_found" }, { status: 404 });

  const messages = database.prepare(`
    SELECT m.id, m.sender_id AS senderId, u.name AS senderName, m.body, m.created_at AS createdAt
    FROM private_messages m
    JOIN "user" u ON u.id = m.sender_id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC, m.id ASC
    LIMIT 500
  `).all(conversationId) as ConversationDetails["messages"];

  const result: ConversationDetails = {
    conversationId,
    otherPlayer: {
      playerId: row.playerId,
      name: row.name,
      avatar: row.profileAvatar || row.userImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(row.name)}`,
      game: row.game ?? "",
      role: row.role ?? "",
    },
    messages,
  };
  return Response.json(result);
}

export async function POST(request: Request, { params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: { body?: unknown };
  try {
    body = await request.json() as { body?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messageBody = typeof body.body === "string" ? body.body.trim() : "";
  if (!messageBody) return Response.json({ error: "message_required" }, { status: 400 });
  if (messageBody.length > 2000) return Response.json({ error: "message_too_long" }, { status: 400 });

  const { conversationId } = await params;
  const conversation = database.prepare(`
    SELECT id, user_one_id AS userOneId, user_two_id AS userTwoId FROM conversations
    WHERE id = ? AND (user_one_id = ? OR user_two_id = ?)
  `).get(conversationId, user.id, user.id) as { id: string; userOneId: string; userTwoId: string } | undefined;
  if (!conversation) return Response.json({ error: "conversation_not_found" }, { status: 404 });

  database.prepare("INSERT INTO private_messages (id, conversation_id, sender_id, body) VALUES (?, ?, ?, ?)").run(randomUUID(), conversationId, user.id, messageBody);
  database.prepare("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(conversationId);
  createNotification(conversation.userOneId === user.id ? conversation.userTwoId : conversation.userOneId, user.id, "message", conversationId);

  return Response.json({ sent: true }, { status: 201 });
}

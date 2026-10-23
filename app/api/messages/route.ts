import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import type { ConversationSummary } from "@/types/message";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  const rows = database.prepare(`
    SELECT
      c.id AS id,
      other.id AS playerId,
      other.name AS name,
      other.image AS userImage,
      p.avatar AS profileAvatar,
      p.game AS game,
      p.role AS role,
      COALESCE((SELECT body FROM private_messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.id DESC LIMIT 1), '') AS lastMessage,
      c.updated_at AS updatedAt
    FROM conversations c
    JOIN "user" other ON other.id = CASE WHEN c.user_one_id = @userId THEN c.user_two_id ELSE c.user_one_id END
    LEFT JOIN player_profiles p ON p.user_id = other.id
    WHERE c.user_one_id = @userId OR c.user_two_id = @userId
    ORDER BY c.updated_at DESC
  `).all({ userId: user.id }) as Array<{
    id: string;
    playerId: string;
    name: string;
    userImage: string | null;
    profileAvatar: string | null;
    game: string | null;
    role: string | null;
    lastMessage: string;
    updatedAt: string;
  }>;

  const conversations: ConversationSummary[] = rows.map((row) => ({
    id: row.id,
    playerId: row.playerId,
    name: row.name,
    avatar: row.profileAvatar || row.userImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(row.name)}`,
    game: row.game ?? "",
    role: row.role ?? "",
    lastMessage: row.lastMessage,
    updatedAt: row.updatedAt,
  }));

  return Response.json({ conversations });
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
  if (playerId === user.id) return Response.json({ error: "cannot_message_yourself" }, { status: 400 });
  if (!database.prepare('SELECT id FROM "user" WHERE id = ?').get(playerId)) {
    return Response.json({ error: "player_not_registered" }, { status: 404 });
  }

  const [userOneId, userTwoId] = [user.id, playerId].sort();
  const conversationId = randomUUID();
  database.prepare(`
    INSERT INTO conversations (id, user_one_id, user_two_id)
    VALUES (?, ?, ?)
    ON CONFLICT (user_one_id, user_two_id) DO NOTHING
  `).run(conversationId, userOneId, userTwoId);

  const conversation = database.prepare("SELECT id FROM conversations WHERE user_one_id = ? AND user_two_id = ?").get(userOneId, userTwoId) as { id: string };
  return Response.json({ conversationId: conversation.id });
}

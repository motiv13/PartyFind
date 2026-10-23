import { database } from "@/lib/db";
import type { FriendRelationship } from "@/types/friend";

type FriendshipRow = {
  requestId: string;
  requesterId: string;
  recipientId: string;
  status: "pending" | "accepted";
  playerId: string;
  name: string;
  userImage: string | null;
  profileAvatar: string | null;
  game: string | null;
  role: string | null;
  country: string | null;
};

export function listFriendRelationships(userId: string): FriendRelationship[] {
  const rows = database.prepare(`
    SELECT
      f.id AS requestId,
      f.requester_id AS requesterId,
      f.recipient_id AS recipientId,
      f.status AS status,
      u.id AS playerId,
      u.name AS name,
      u.image AS userImage,
      p.avatar AS profileAvatar,
      p.game AS game,
      p.role AS role,
      p.country AS country
    FROM player_friendships f
    JOIN "user" u ON u.id = CASE WHEN f.requester_id = @userId THEN f.recipient_id ELSE f.requester_id END
    LEFT JOIN player_profiles p ON p.user_id = u.id
    WHERE f.requester_id = @userId OR f.recipient_id = @userId
    ORDER BY f.created_at DESC
  `).all({ userId }) as FriendshipRow[];

  return rows.map((row) => ({
    requestId: row.requestId,
    playerId: row.playerId,
    name: row.name,
    avatar: row.profileAvatar || row.userImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(row.name)}`,
    game: row.game ?? "",
    role: row.role ?? "",
    country: row.country ?? "",
    status: row.status,
    direction: row.status === "accepted" ? "friend" : row.recipientId === userId ? "incoming" : "outgoing",
  }));
}

export function getFriendshipBetween(firstUserId: string, secondUserId: string) {
  return database.prepare(`
    SELECT id, requester_id AS requesterId, recipient_id AS recipientId, status
    FROM player_friendships
    WHERE (requester_id = ? AND recipient_id = ?)
       OR (requester_id = ? AND recipient_id = ?)
    LIMIT 1
  `).get(firstUserId, secondUserId, secondUserId, firstUserId) as {
    id: string;
    requesterId: string;
    recipientId: string;
    status: "pending" | "accepted";
  } | undefined;
}

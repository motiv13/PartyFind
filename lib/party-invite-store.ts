import { database } from "@/lib/db";
import type { PartyInvite } from "@/types/invite";

type InviteRow = {
  id: string;
  senderId: string;
  recipientId: string;
  game: string;
  note: string;
  status: PartyInvite["status"];
  createdAt: string;
  playerId: string;
  playerName: string;
  userImage: string | null;
  profileAvatar: string | null;
  role: string | null;
};

export function listPartyInvites(userId: string): PartyInvite[] {
  const rows = database.prepare(`
    SELECT
      i.id AS id,
      i.sender_id AS senderId,
      i.recipient_id AS recipientId,
      i.game AS game,
      i.note AS note,
      i.status AS status,
      i.created_at AS createdAt,
      other.id AS playerId,
      other.name AS playerName,
      other.image AS userImage,
      p.avatar AS profileAvatar,
      p.role AS role
    FROM party_invites i
    JOIN "user" other ON other.id = CASE WHEN i.sender_id = @userId THEN i.recipient_id ELSE i.sender_id END
    LEFT JOIN player_profiles p ON p.user_id = other.id
    WHERE i.sender_id = @userId OR i.recipient_id = @userId
    ORDER BY i.created_at DESC, i.id DESC
  `).all({ userId }) as InviteRow[];

  return rows.map((row) => ({
    id: row.id,
    playerId: row.playerId,
    playerName: row.playerName,
    avatar: row.profileAvatar || row.userImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(row.playerName)}`,
    role: row.role ?? "",
    game: row.game,
    note: row.note,
    status: row.status,
    direction: row.senderId === userId ? "outgoing" : "incoming",
    createdAt: row.createdAt,
  }));
}

import { randomUUID } from "node:crypto";
import { database } from "@/lib/db";

export type NotificationKind = "friend_request" | "friend_accepted" | "party_invite" | "party_invite_accepted" | "party_invite_declined" | "message";

export type PartyFindNotification = {
  id: string;
  kind: NotificationKind;
  actorName: string;
  actorAvatar: string;
  referenceId: string;
  createdAt: string;
  read: boolean;
};

export function createNotification(userId: string, actorId: string, kind: NotificationKind, referenceId = "") {
  database.prepare("INSERT INTO notifications (id, user_id, actor_id, kind, reference_id) VALUES (?, ?, ?, ?, ?)")
    .run(randomUUID(), userId, actorId, kind, referenceId);
}

export function listNotifications(userId: string) {
  const rows = database.prepare(`
    SELECT n.id, n.kind, n.reference_id AS referenceId, n.created_at AS createdAt,
      n.read_at AS readAt, COALESCE(u.name, 'PartyFind') AS actorName,
      u.image AS userImage, p.avatar AS profileAvatar
    FROM notifications n
    LEFT JOIN "user" u ON u.id = n.actor_id
    LEFT JOIN player_profiles p ON p.user_id = u.id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC, n.id DESC
    LIMIT 50
  `).all(userId) as Array<{ id: string; kind: NotificationKind; referenceId: string; createdAt: string; readAt: string | null; actorName: string; userImage: string | null; profileAvatar: string | null }>;

  const unreadCount = database.prepare("SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL").get(userId) as { count: number };
  return {
    unreadCount: unreadCount.count,
    notifications: rows.map((row): PartyFindNotification => ({
      id: row.id, kind: row.kind, actorName: row.actorName,
      actorAvatar: row.profileAvatar || row.userImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(row.actorName)}`,
      referenceId: row.referenceId, createdAt: row.createdAt, read: row.readAt !== null,
    })),
  };
}

export function markNotificationsRead(userId: string, ids?: string[]) {
  if (!ids?.length) {
    database.prepare("UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL").run(userId);
    return;
  }
  const placeholders = ids.map(() => "?").join(",");
  database.prepare(`UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL AND id IN (${placeholders})`).run(userId, ...ids);
}

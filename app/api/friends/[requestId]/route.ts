import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import { createNotification } from "@/lib/notification-store";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ requestId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: { action?: unknown };
  try {
    body = await request.json() as { action?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const { requestId } = await params;
  const relationship = database.prepare(`
    SELECT id, requester_id AS requesterId, recipient_id AS recipientId, status
    FROM player_friendships WHERE id = ?
  `).get(requestId) as { id: string; requesterId: string; recipientId: string; status: "pending" | "accepted" } | undefined;
  if (!relationship || (relationship.requesterId !== user.id && relationship.recipientId !== user.id)) {
    return Response.json({ error: "relationship_not_found" }, { status: 404 });
  }

  if (body.action === "accept") {
    if (relationship.status !== "pending" || relationship.recipientId !== user.id) {
      return Response.json({ error: "cannot_accept_request" }, { status: 409 });
    }
    database.prepare("UPDATE player_friendships SET status = 'accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(requestId);
    createNotification(relationship.requesterId, user.id, "friend_accepted", requestId);
    return Response.json({ status: "accepted" });
  }

  if (body.action === "cancel" || body.action === "decline") {
    const canRemovePending = relationship.status === "pending" && (
      (body.action === "cancel" && relationship.requesterId === user.id) ||
      (body.action === "decline" && relationship.recipientId === user.id)
    );
    if (!canRemovePending) return Response.json({ error: "cannot_remove_request" }, { status: 409 });
    database.prepare("DELETE FROM player_friendships WHERE id = ?").run(requestId);
    return Response.json({ status: body.action === "cancel" ? "cancelled" : "declined" });
  }

  if (body.action === "remove") {
    if (relationship.status !== "accepted") return Response.json({ error: "not_friends" }, { status: 409 });
    database.prepare("DELETE FROM player_friendships WHERE id = ?").run(requestId);
    return Response.json({ status: "removed" });
  }

  return Response.json({ error: "invalid_action" }, { status: 400 });
}

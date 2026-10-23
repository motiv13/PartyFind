import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import { createNotification } from "@/lib/notification-store";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: Promise<{ inviteId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: { action?: unknown };
  try {
    body = await request.json() as { action?: unknown };
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const { inviteId } = await params;
  const invite = database.prepare(`
    SELECT id, sender_id AS senderId, recipient_id AS recipientId, status
    FROM party_invites WHERE id = ?
  `).get(inviteId) as { id: string; senderId: string; recipientId: string; status: "pending" | "accepted" | "declined" } | undefined;
  if (!invite || (invite.senderId !== user.id && invite.recipientId !== user.id)) {
    return Response.json({ error: "invite_not_found" }, { status: 404 });
  }

  if (invite.status !== "pending") return Response.json({ error: "invite_no_longer_pending" }, { status: 409 });

  if (body.action === "accept" || body.action === "decline") {
    if (invite.recipientId !== user.id) return Response.json({ error: "recipient_only" }, { status: 403 });
    database.prepare("UPDATE party_invites SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(body.action === "accept" ? "accepted" : "declined", inviteId);
    createNotification(invite.senderId, user.id, body.action === "accept" ? "party_invite_accepted" : "party_invite_declined", inviteId);
    return Response.json({ status: body.action === "accept" ? "accepted" : "declined" });
  }

  if (body.action === "cancel") {
    if (invite.senderId !== user.id) return Response.json({ error: "sender_only" }, { status: 403 });
    database.prepare("DELETE FROM party_invites WHERE id = ?").run(inviteId);
    return Response.json({ status: "cancelled" });
  }

  return Response.json({ error: "invalid_action" }, { status: 400 });
}

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { listNotifications, markNotificationsRead } from "@/lib/notification-store";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });
  return Response.json(listNotifications(user.id));
}

export async function PATCH(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });
  let body: { ids?: unknown } = {};
  try { body = await request.json() as { ids?: unknown }; } catch { /* Empty body marks all read. */ }
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === "string").slice(0, 50) : undefined;
  markNotificationsRead(user.id, ids);
  return Response.json(listNotifications(user.id));
}

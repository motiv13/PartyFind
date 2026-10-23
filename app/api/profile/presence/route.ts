import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { touchPresence } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  touchPresence(session.user.id, session.user.name);
  return new Response(null, { status: 204 });
}

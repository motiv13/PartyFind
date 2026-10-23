import { listProfiles } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({ players: listProfiles() });
}

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import { games } from "@/data/games";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function GET() {
  const user = await getUser();
  const communities = database.prepare(`
    SELECT c.id, c.kind, c.name, c.game, c.region, c.description, c.recruiting, c.created_at AS createdAt,
      u.id AS ownerId, u.name AS ownerName, u.image AS ownerImage,
      p.avatar AS ownerAvatar,
      (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) AS memberCount,
      CASE WHEN EXISTS (
        SELECT 1 FROM community_members mine WHERE mine.community_id = c.id AND mine.user_id = ?
      ) THEN 1 ELSE 0 END AS isMember,
      CASE WHEN c.owner_id = ? THEN 1 ELSE 0 END AS isOwner
    FROM communities c
    JOIN "user" u ON u.id = c.owner_id
    LEFT JOIN player_profiles p ON p.user_id = u.id
    ORDER BY memberCount DESC, c.created_at DESC
    LIMIT 100
  `).all(user?.id ?? "", user?.id ?? "") as Array<{
    id: string; kind: "community" | "guild"; name: string; game: string; region: string; description: string; recruiting: number; createdAt: string;
    ownerId: string; ownerName: string; ownerImage: string | null; ownerAvatar: string | null;
    memberCount: number; isMember: number; isOwner: number;
  }>;
  return Response.json({ communities: communities.map((community) => ({
    ...community,
    ownerAvatar: community.ownerAvatar || community.ownerImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(community.ownerName)}`,
    isMember: Boolean(community.isMember),
    isOwner: Boolean(community.isOwner),
  })) });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let body: { action?: unknown; kind?: unknown; name?: unknown; game?: unknown; region?: unknown; description?: unknown; recruiting?: unknown; communityId?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  if (body.action === "create") {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const game = typeof body.game === "string" ? body.game.trim() : "";
    const kind = body.kind === "guild" ? "guild" : "community";
    const region = typeof body.region === "string" ? body.region.trim().slice(0, 80) : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const recruiting = body.recruiting === false ? 0 : 1;
    if (name.length < 3 || name.length > 60) return Response.json({ error: "invalid_name" }, { status: 400 });
    if (!games.includes(game) || game === "All") return Response.json({ error: "invalid_game" }, { status: 400 });
    if (description.length > 500) return Response.json({ error: "description_too_long" }, { status: 400 });
    const id = randomUUID();
    const create = database.transaction(() => {
      database.prepare("INSERT INTO communities (id, owner_id, kind, name, game, region, description, recruiting) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(id, user.id, kind, name, game, region, description, recruiting);
      database.prepare("INSERT INTO community_members (community_id, user_id, role) VALUES (?, ?, 'owner')").run(id, user.id);
    });
    create();
    return Response.json({ id }, { status: 201 });
  }

  const communityId = typeof body.communityId === "string" ? body.communityId.trim() : "";
  if (!communityId) return Response.json({ error: "community_required" }, { status: 400 });
  const community = database.prepare("SELECT id, owner_id AS ownerId, kind, recruiting FROM communities WHERE id = ?").get(communityId) as { id: string; ownerId: string; kind: string; recruiting: number } | undefined;
  if (!community) return Response.json({ error: "community_not_found" }, { status: 404 });

  if (body.action === "join") {
    if (community.kind === "guild" && !community.recruiting) return Response.json({ error: "guild_not_recruiting" }, { status: 409 });
    database.prepare("INSERT INTO community_members (community_id, user_id) VALUES (?, ?) ON CONFLICT DO NOTHING").run(communityId, user.id);
    return Response.json({ status: "joined" });
  }
  if (body.action === "leave") {
    if (community.ownerId === user.id) return Response.json({ error: "owner_cannot_leave" }, { status: 409 });
    database.prepare("DELETE FROM community_members WHERE community_id = ? AND user_id = ?").run(communityId, user.id);
    return Response.json({ status: "left" });
  }
  return Response.json({ error: "invalid_action" }, { status: 400 });
}

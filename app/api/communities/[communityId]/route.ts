import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { database } from "@/lib/db";
import { games } from "@/data/games";

export const runtime = "nodejs";

async function getUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

type CommunityRow = {
  id: string; kind: "community" | "guild"; name: string; game: string; region: string; description: string; recruiting: number; createdAt: string;
  ownerId: string; ownerName: string; ownerAvatar: string | null; ownerImage: string | null; memberCount: number; isMember: number; isOwner: number;
};

export async function GET(_request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  const { communityId } = await params;
  const user = await getUser();
  const community = database.prepare(`
    SELECT c.id, c.kind, c.name, c.game, c.region, c.description, c.recruiting, c.created_at AS createdAt,
      u.id AS ownerId, u.name AS ownerName, p.avatar AS ownerAvatar, u.image AS ownerImage,
      (SELECT COUNT(*) FROM community_members cm WHERE cm.community_id = c.id) AS memberCount,
      CASE WHEN EXISTS (SELECT 1 FROM community_members mine WHERE mine.community_id = c.id AND mine.user_id = ?) THEN 1 ELSE 0 END AS isMember,
      CASE WHEN c.owner_id = ? THEN 1 ELSE 0 END AS isOwner
    FROM communities c
    JOIN "user" u ON u.id = c.owner_id
    LEFT JOIN player_profiles p ON p.user_id = u.id
    WHERE c.id = ?
  `).get(user?.id ?? "", user?.id ?? "", communityId) as CommunityRow | undefined;
  if (!community) return Response.json({ error: "community_not_found" }, { status: 404 });

  const members = database.prepare(`
    SELECT u.id, COALESCE(p.name, u.name) AS name, p.avatar AS profileAvatar, u.image AS accountAvatar,
      p.user_id IS NOT NULL AS hasProfile, cm.role, cm.joined_at AS joinedAt
    FROM community_members cm
    JOIN "user" u ON u.id = cm.user_id
    LEFT JOIN player_profiles p ON p.user_id = u.id
    WHERE cm.community_id = ?
    ORDER BY CASE WHEN cm.role = 'owner' THEN 0 ELSE 1 END, cm.joined_at ASC
  `).all(communityId) as Array<{ id: string; name: string; profileAvatar: string | null; accountAvatar: string | null; hasProfile: number; role: string; joinedAt: string }>;

  return Response.json({
    community: {
      ...community,
      ownerAvatar: community.ownerAvatar || community.ownerImage || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(community.ownerName)}`,
      recruiting: Boolean(community.recruiting),
      isMember: Boolean(community.isMember),
      isOwner: Boolean(community.isOwner),
    },
    members: members.map((member) => ({
      id: member.id,
      name: member.name,
      avatar: member.profileAvatar || member.accountAvatar || `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(member.name)}`,
      hasProfile: Boolean(member.hasProfile),
      role: member.role,
      joinedAt: member.joinedAt,
    })),
  });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ communityId: string }> }) {
  const user = await getUser();
  if (!user) return Response.json({ error: "not_signed_in" }, { status: 401 });
  const { communityId } = await params;
  let body: { name?: unknown; game?: unknown; region?: unknown; description?: unknown; recruiting?: unknown };
  try { body = await request.json() as typeof body; }
  catch { return Response.json({ error: "invalid_json" }, { status: 400 }); }

  const current = database.prepare("SELECT owner_id AS ownerId, name, game, region, description, recruiting FROM communities WHERE id = ?").get(communityId) as { ownerId: string; name: string; game: string; region: string; description: string; recruiting: number } | undefined;
  if (!current) return Response.json({ error: "community_not_found" }, { status: 404 });
  if (current.ownerId !== user.id) return Response.json({ error: "owner_required" }, { status: 403 });

  const name = typeof body.name === "string" ? body.name.trim() : current.name;
  const game = typeof body.game === "string" ? body.game.trim() : current.game;
  const region = typeof body.region === "string" ? body.region.trim() : current.region;
  const description = typeof body.description === "string" ? body.description.trim() : current.description;
  const recruiting = typeof body.recruiting === "boolean" ? Number(body.recruiting) : current.recruiting;
  if (name.length < 3 || name.length > 60) return Response.json({ error: "invalid_name" }, { status: 400 });
  if (!games.includes(game) || game === "All") return Response.json({ error: "invalid_game" }, { status: 400 });
  if (region.length > 80) return Response.json({ error: "region_too_long" }, { status: 400 });
  if (description.length > 500) return Response.json({ error: "description_too_long" }, { status: 400 });

  database.prepare("UPDATE communities SET name = ?, game = ?, region = ?, description = ?, recruiting = ? WHERE id = ?")
    .run(name, game, region, description, recruiting, communityId);
  return Response.json({ status: "updated" });
}

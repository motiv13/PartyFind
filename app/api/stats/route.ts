import { database } from "@/lib/db";

export const runtime = "nodejs";

type StatsRow = {
  players: number;
  communities: number;
  guilds: number;
  online: number;
};

export async function GET() {
  const stats = database.prepare(`
    SELECT
      (SELECT COUNT(*) FROM player_profiles) AS players,
      (SELECT COUNT(*) FROM communities WHERE kind = 'community') AS communities,
      (SELECT COUNT(*) FROM communities WHERE kind = 'guild') AS guilds,
      (SELECT COUNT(*) FROM player_profiles
        WHERE last_seen_at >= datetime('now', '-90 seconds')) AS online
  `).get() as StatsRow;

  const games = database.prepare(`
    SELECT game, COUNT(*) AS players
    FROM player_profiles
    GROUP BY game
  `).all() as Array<{ game: string; players: number }>;

  return Response.json(
    { ...stats, games: Object.fromEntries(games.map(({ game, players }) => [game, players])) },
    { headers: { "Cache-Control": "no-store" } },
  );
}

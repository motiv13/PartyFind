import { database } from "@/lib/db";
import type { Player } from "@/types/player";

type ProfileRow = {
  user_id: string;
  name: string;
  avatar: string;
  game: string;
  role: string;
  country: string;
  online: number;
  voice: number;
  rank: string | null;
  bio: string;
  discord: string;
  languages: string;
  favorite_games: string;
  looking_for: string;
  tags: string;
  last_seen_at: string | null;
};

function wasRecentlySeen(lastSeenAt: string | null) {
  if (!lastSeenAt) return false;
  const timestamp = Date.parse(`${lastSeenAt.replace(" ", "T")}Z`);
  return Number.isFinite(timestamp) && Date.now() - timestamp < 90_000;
}

function toPlayer(row: ProfileRow): Player {
  return {
    id: row.user_id,
    name: row.name,
    avatar: row.avatar,
    game: row.game,
    role: row.role,
    country: row.country,
    online: wasRecentlySeen(row.last_seen_at),
    voice: Boolean(row.voice),
    rank: row.rank ?? undefined,
    bio: row.bio,
    discord: row.discord,
    languages: JSON.parse(row.languages) as string[],
    favoriteGames: JSON.parse(row.favorite_games) as string[],
    lookingFor: JSON.parse(row.looking_for) as string[],
    tags: JSON.parse(row.tags) as string[],
  };
}

const selectByUserId = database.prepare(
  "SELECT * FROM player_profiles WHERE user_id = ?",
);

export function getProfile(userId: string): Player | null {
  const row = selectByUserId.get(userId) as ProfileRow | undefined;
  return row ? toPlayer(row) : null;
}

export function getOrCreateProfile(userId: string, name: string): Player {
  database.prepare(`
    INSERT OR IGNORE INTO player_profiles (user_id, name, avatar)
    VALUES (?, ?, ?)
  `).run(userId, name, `https://api.dicebear.com/9.x/pixel-art/png?seed=${encodeURIComponent(name)}`);

  return getProfile(userId)!;
}

export function saveProfile(userId: string, player: Player): Player {
  database.prepare(`
    INSERT INTO player_profiles (
      user_id, name, avatar, game, role, country, online, voice, rank, bio,
      discord, languages, favorite_games, looking_for, tags, updated_at
    ) VALUES (
      @user_id, @name, @avatar, @game, @role, @country, @online, @voice, @rank, @bio,
      @discord, @languages, @favorite_games, @looking_for, @tags, CURRENT_TIMESTAMP
    )
    ON CONFLICT(user_id) DO UPDATE SET
      name = excluded.name,
      avatar = excluded.avatar,
      game = excluded.game,
      role = excluded.role,
      country = excluded.country,
      voice = excluded.voice,
      rank = excluded.rank,
      bio = excluded.bio,
      discord = excluded.discord,
      languages = excluded.languages,
      favorite_games = excluded.favorite_games,
      looking_for = excluded.looking_for,
      tags = excluded.tags,
      updated_at = CURRENT_TIMESTAMP
  `).run({
    user_id: userId,
    name: player.name,
    avatar: player.avatar,
    game: player.game,
    role: player.role,
    country: player.country,
    online: Number(player.online),
    voice: Number(player.voice),
    rank: player.rank ?? null,
    bio: player.bio,
    discord: player.discord,
    languages: JSON.stringify(player.languages),
    favorite_games: JSON.stringify(player.favoriteGames),
    looking_for: JSON.stringify(player.lookingFor),
    tags: JSON.stringify(player.tags ?? []),
  });

  return getProfile(userId)!;
}

export function touchPresence(userId: string, name: string) {
  getOrCreateProfile(userId, name);
  database.prepare(`
    UPDATE player_profiles
    SET online = 1, last_seen_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(userId);
}

export function listProfiles(): Player[] {
  const rows = database.prepare(
    "SELECT * FROM player_profiles ORDER BY updated_at DESC",
  ).all() as ProfileRow[];
  return rows.map(toPlayer);
}

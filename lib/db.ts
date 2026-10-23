import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });

const globalForPartyFind = globalThis as typeof globalThis & {
  partyFindDatabase?: Database.Database;
};

export const database =
  globalForPartyFind.partyFindDatabase ??
  new Database(path.join(dataDirectory, "partyfind.sqlite"));

if (process.env.NODE_ENV !== "production") {
  globalForPartyFind.partyFindDatabase = database;
}

database.pragma("journal_mode = WAL");
database.pragma("foreign_keys = ON");

database.exec(`
  CREATE TABLE IF NOT EXISTS communities (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    kind TEXT NOT NULL DEFAULT 'community' CHECK (kind IN ('community', 'guild')),
    name TEXT NOT NULL CHECK (length(name) BETWEEN 3 AND 60),
    game TEXT NOT NULL,
    region TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 500),
    recruiting INTEGER NOT NULL DEFAULT 1 CHECK (recruiting IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS communities_game_created
    ON communities (game, created_at DESC);

  CREATE TABLE IF NOT EXISTS community_members (
    community_id TEXT NOT NULL REFERENCES communities (id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS community_members_user
    ON community_members (user_id, joined_at DESC);

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    actor_id TEXT REFERENCES "user" (id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('friend_request', 'friend_accepted', 'party_invite', 'party_invite_accepted', 'party_invite_declined', 'message')),
    reference_id TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TEXT
  );
  CREATE INDEX IF NOT EXISTS notifications_user_created
    ON notifications (user_id, created_at DESC);

  CREATE TABLE IF NOT EXISTS player_profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    game TEXT NOT NULL DEFAULT 'World of Warcraft',
    role TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL DEFAULT '',
    online INTEGER NOT NULL DEFAULT 0,
    voice INTEGER NOT NULL DEFAULT 1,
    rank TEXT,
    bio TEXT NOT NULL DEFAULT '',
    discord TEXT NOT NULL DEFAULT '',
    languages TEXT NOT NULL DEFAULT '[]',
    favorite_games TEXT NOT NULL DEFAULT '[]',
    looking_for TEXT NOT NULL DEFAULT '[]',
    last_seen_at TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const communityColumns = database.pragma("table_info(communities)") as { name: string }[];
if (!communityColumns.some((column) => column.name === "kind")) {
  database.exec("ALTER TABLE communities ADD COLUMN kind TEXT NOT NULL DEFAULT 'community'");
}
if (!communityColumns.some((column) => column.name === "region")) {
  database.exec("ALTER TABLE communities ADD COLUMN region TEXT NOT NULL DEFAULT ''");
}
if (!communityColumns.some((column) => column.name === "recruiting")) {
  database.exec("ALTER TABLE communities ADD COLUMN recruiting INTEGER NOT NULL DEFAULT 1");
}

const profileColumns = database.pragma("table_info(player_profiles)") as { name: string }[];
if (!profileColumns.some((column) => column.name === "tags")) {
  database.exec("ALTER TABLE player_profiles ADD COLUMN tags TEXT NOT NULL DEFAULT '[]'");
}
if (!profileColumns.some((column) => column.name === "last_seen_at")) {
  database.exec("ALTER TABLE player_profiles ADD COLUMN last_seen_at TEXT");
}

database.exec(`
  CREATE TABLE IF NOT EXISTS player_friendships (
    id TEXT PRIMARY KEY,
    requester_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    recipient_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (requester_id, recipient_id),
    CHECK (requester_id <> recipient_id)
  );
  CREATE INDEX IF NOT EXISTS player_friendships_recipient_status
    ON player_friendships (recipient_id, status);

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user_one_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    user_two_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_one_id, user_two_id),
    CHECK (user_one_id < user_two_id)
  );

  CREATE TABLE IF NOT EXISTS private_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 2000),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS private_messages_conversation_created
    ON private_messages (conversation_id, created_at, id);

  CREATE TABLE IF NOT EXISTS party_invites (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    recipient_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (sender_id <> recipient_id)
  );
  CREATE INDEX IF NOT EXISTS party_invites_recipient_status
    ON party_invites (recipient_id, status, created_at);
  CREATE INDEX IF NOT EXISTS party_invites_sender_status
    ON party_invites (sender_id, status, created_at);

  CREATE TABLE IF NOT EXISTS feed_posts (
    id TEXT PRIMARY KEY,
    author_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    activity TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    event_at TEXT,
    image_url TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS feed_posts_created
    ON feed_posts (created_at DESC);

  CREATE TABLE IF NOT EXISTS feed_likes (
    post_id TEXT NOT NULL REFERENCES feed_posts (id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS feed_comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES feed_posts (id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
    body TEXT NOT NULL CHECK (length(body) BETWEEN 1 AND 500),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS feed_comments_post_created
    ON feed_comments (post_id, created_at);
`);

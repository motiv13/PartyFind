import { randomUUID } from "node:crypto";
import { database } from "@/lib/db";
import type { FeedComment, FeedPost } from "@/types/feed";

type PostRow = {
  id: string;
  game: string;
  activity: string;
  title: string;
  body: string;
  event_at: string | null;
  image_url: string | null;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
  like_count: number;
  comment_count: number;
  liked_by_me: number;
};

type CommentRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_avatar: string;
};

function toFeedPost(row: PostRow): FeedPost {
  return {
    id: row.id,
    game: row.game,
    activity: row.activity,
    title: row.title,
    body: row.body,
    eventAt: row.event_at,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    likedByMe: Boolean(row.liked_by_me),
  };
}

export function listFeedPosts(viewerId: string | null): FeedPost[] {
  const rows = database.prepare(`
    SELECT
      p.*,
      author.name AS author_name,
      author.avatar AS author_avatar,
      (SELECT COUNT(*) FROM feed_likes l WHERE l.post_id = p.id) AS like_count,
      (SELECT COUNT(*) FROM feed_comments c WHERE c.post_id = p.id) AS comment_count,
      CASE WHEN ? IS NOT NULL AND EXISTS (
        SELECT 1 FROM feed_likes mine WHERE mine.post_id = p.id AND mine.user_id = ?
      ) THEN 1 ELSE 0 END AS liked_by_me
    FROM feed_posts p
    JOIN player_profiles author ON author.user_id = p.author_id
    ORDER BY p.created_at DESC
    LIMIT 50
  `).all(viewerId, viewerId) as PostRow[];
  return rows.map(toFeedPost);
}

export function createFeedPost(post: {
  id: string;
  authorId: string;
  game: string;
  activity: string;
  title: string;
  body: string;
  eventAt: string | null;
  imageUrl: string | null;
}) {
  database.prepare(`
    INSERT INTO feed_posts (id, author_id, game, activity, title, body, event_at, image_url)
    VALUES (@id, @authorId, @game, @activity, @title, @body, @eventAt, @imageUrl)
  `).run(post);
}

export function getFeedPostAuthor(postId: string): string | null {
  const row = database.prepare("SELECT author_id FROM feed_posts WHERE id = ?").get(postId) as { author_id: string } | undefined;
  return row?.author_id ?? null;
}

export function deleteFeedPost(postId: string) {
  return database.prepare("DELETE FROM feed_posts WHERE id = ?").run(postId).changes > 0;
}

export function toggleFeedLike(postId: string, userId: string) {
  return database.transaction(() => {
    const existing = database.prepare("SELECT 1 FROM feed_likes WHERE post_id = ? AND user_id = ?").get(postId, userId);
    if (existing) {
      database.prepare("DELETE FROM feed_likes WHERE post_id = ? AND user_id = ?").run(postId, userId);
      return false;
    }
    database.prepare("INSERT INTO feed_likes (post_id, user_id) VALUES (?, ?)").run(postId, userId);
    return true;
  })();
}

export function listFeedComments(postId: string): FeedComment[] {
  const rows = database.prepare(`
    SELECT c.id, c.body, c.created_at, c.author_id,
      author.name AS author_name, author.avatar AS author_avatar
    FROM feed_comments c
    JOIN player_profiles author ON author.user_id = c.author_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC, c.id ASC
    LIMIT 100
  `).all(postId) as CommentRow[];
  return rows.map((row) => ({
    id: row.id,
    body: row.body,
    createdAt: row.created_at,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
  }));
}

export function createFeedComment(postId: string, authorId: string, body: string) {
  const id = randomUUID();
  database.prepare("INSERT INTO feed_comments (id, post_id, author_id, body) VALUES (?, ?, ?, ?)").run(id, postId, authorId, body);
  return id;
}

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createFeedComment, getFeedPostAuthor, listFeedComments } from "@/lib/feed-store";
import { getOrCreateProfile } from "@/lib/profile-store";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  if (!getFeedPostAuthor(postId)) return Response.json({ error: "post_not_found" }, { status: 404 });
  return Response.json({ comments: listFeedComments(postId) });
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  const { postId } = await params;
  if (!getFeedPostAuthor(postId)) return Response.json({ error: "post_not_found" }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const content = typeof body === "object" && body && "body" in body && typeof body.body === "string" ? body.body.trim().slice(0, 500) : "";
  if (!content) return Response.json({ error: "comment_required" }, { status: 400 });

  getOrCreateProfile(session.user.id, session.user.name);
  const id = createFeedComment(postId, session.user.id, content);
  return Response.json({ id }, { status: 201 });
}

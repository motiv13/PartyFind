import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { deleteFeedPost, getFeedPostAuthor } from "@/lib/feed-store";

export const runtime = "nodejs";

export async function DELETE(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  const { postId } = await params;
  const authorId = getFeedPostAuthor(postId);
  if (!authorId) return Response.json({ error: "post_not_found" }, { status: 404 });
  if (authorId !== session.user.id) return Response.json({ error: "not_post_author" }, { status: 403 });

  deleteFeedPost(postId);
  return new Response(null, { status: 204 });
}

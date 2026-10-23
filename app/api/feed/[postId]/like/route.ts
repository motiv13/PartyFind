import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getFeedPostAuthor, toggleFeedLike } from "@/lib/feed-store";

export const runtime = "nodejs";

export async function POST(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  const { postId } = await params;
  if (!getFeedPostAuthor(postId)) return Response.json({ error: "post_not_found" }, { status: 404 });
  const liked = toggleFeedLike(postId, session.user.id);
  return Response.json({ liked });
}

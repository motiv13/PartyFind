import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const contentTypes: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const match = /^([a-f0-9-]+)\.(jpg|png|webp)$/.exec(filename);
  if (!match) return new Response("Not found", { status: 404 });

  try {
    const bytes = await readFile(path.join(process.cwd(), "data", "avatars", filename));
    return new Response(bytes, {
      headers: {
        "Content-Type": contentTypes[match[2]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

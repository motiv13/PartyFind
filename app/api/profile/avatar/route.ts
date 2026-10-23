import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_AVATAR_SIZE = 3 * 1024 * 1024;
const formats = [
  { mime: "image/jpeg", extension: "jpg", signature: (bytes: Buffer) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { mime: "image/png", extension: "png", signature: (bytes: Buffer) => bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: "image/webp", extension: "webp", signature: (bytes: Buffer) => bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP" },
];

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return Response.json({ error: "not_signed_in" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = form.get("avatar");
  if (!(file instanceof File)) return Response.json({ error: "avatar_required" }, { status: 400 });
  if (!file.size || file.size > MAX_AVATAR_SIZE) {
    return Response.json({ error: "avatar_too_large" }, { status: 413 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const format = formats.find((candidate) => candidate.mime === file.type && candidate.signature(bytes));
  if (!format) return Response.json({ error: "unsupported_image" }, { status: 415 });

  const directory = path.join(process.cwd(), "data", "avatars");
  await mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${format.extension}`;
  await writeFile(path.join(directory, filename), bytes, { flag: "wx" });

  return Response.json({ avatar: `/api/profile/avatar/${filename}` });
}

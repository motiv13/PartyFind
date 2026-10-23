"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

export default function MessageButton({ playerId }: { playerId: string | number }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");
  const unsupported = typeof playerId !== "string";

  async function openConversation() {
    if (unsupported) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId }),
      });
      if (response.status === 401) {
        setSignedOut(true);
        return;
      }
      const result = await response.json() as { conversationId?: string; error?: string };
      if (!response.ok || !result.conversationId) {
        setError(result.error === "cannot_message_yourself" ? "You cannot message yourself." : "Messages are available for registered players.");
        return;
      }
      router.push(`/messages/${result.conversationId}`);
    } catch {
      setError("Could not connect to PartyFind. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (signedOut) {
    return <Link href="/login" className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500"><MessageCircle size={20} />{t("Sign in to message")}</Link>;
  }

  return (
    <div>
      <button type="button" disabled={busy || unsupported} onClick={() => void openConversation()} className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
        <MessageCircle size={20} />{busy ? t("Opening…") : unsupported ? t("Demo profile") : t("Message")}
      </button>
      {(unsupported || error) && <p className="mt-2 text-center text-xs text-zinc-500">{error || t("This sample profile is not connected to a player account.")}</p>}
    </div>
  );
}

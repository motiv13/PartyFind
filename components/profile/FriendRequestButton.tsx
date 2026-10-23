"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock3, UserMinus, UserPlus } from "lucide-react";
import type { FriendRelationship } from "@/types/friend";
import { useLanguage } from "@/lib/i18n";

type FriendRequestButtonProps = { playerId: string | number };

export default function FriendRequestButton({ playerId }: FriendRequestButtonProps) {
  const { t } = useLanguage();
  const [relationship, setRelationship] = useState<FriendRelationship | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "unsupported" | "error">("loading");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const loadRelationship = useCallback(async () => {
    if (typeof playerId !== "string") {
      setState("unsupported");
      return;
    }
    try {
      const response = await fetch("/api/friends");
      if (response.status === 401) {
        setState("signed-out");
        return;
      }
      if (!response.ok) throw new Error();
      const result = await response.json() as { relationships: FriendRelationship[] };
      setRelationship(result.relationships.find((item) => item.playerId === playerId) ?? null);
      setState("ready");
    } catch {
      setState("error");
    }
  }, [playerId]);

  useEffect(() => { void loadRelationship(); }, [loadRelationship]);

  async function handleClick() {
    setBusy(true);
    setMessage("");
    try {
      const response = relationship
        ? await fetch(`/api/friends/${relationship.requestId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: relationship.direction === "incoming" ? "accept" : relationship.direction === "outgoing" ? "cancel" : "remove" }),
          })
        : await fetch("/api/friends", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ playerId }),
          });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        setMessage(result.error === "cannot_add_yourself" ? "You cannot add yourself." : "Could not update this friend request.");
      }
      await loadRelationship();
    } catch {
      setMessage("Could not connect to PartyFind. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "signed-out") {
    return <Link href="/login" className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 py-3 font-semibold text-white transition hover:border-blue-500 hover:bg-zinc-700"><UserPlus size={20} />{t("Sign in to add friend")}</Link>;
  }

  const label = t(state === "unsupported" ? "Demo profile" : state === "loading" ? "Loading…" : relationship?.direction === "incoming" ? "Accept request" : relationship?.direction === "outgoing" ? "Request sent · cancel" : relationship?.direction === "friend" ? "Remove friend" : "Add Friend");
  const Icon = relationship?.direction === "incoming" ? Check : relationship?.direction === "outgoing" ? Clock3 : relationship?.direction === "friend" ? UserMinus : UserPlus;

  return (
    <div>
      <button type="button" disabled={state !== "ready" || busy} onClick={() => void handleClick()} className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 py-3 font-semibold text-white transition hover:border-blue-500 hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60">
        <Icon size={20} />{busy ? "Updating…" : label}
      </button>
      {message && <p role="alert" className="mt-2 text-center text-xs text-rose-400">{message}</p>}
      {state === "unsupported" && <p className="mt-2 text-center text-xs text-zinc-500">{t("This sample profile is not connected to a player account, so it cannot receive friend requests.")}</p>}
      {state === "error" && <p className="mt-2 text-center text-xs text-rose-400">{t("Could not load friend status.")}</p>}
    </div>
  );
}

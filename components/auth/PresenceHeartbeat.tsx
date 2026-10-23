"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function PresenceHeartbeat() {
  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    const sendHeartbeat = () => {
      if (document.visibilityState !== "visible") return;
      void fetch("/api/profile/presence", { method: "POST", keepalive: true }).catch(() => undefined);
    };

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 30_000);
    document.addEventListener("visibilitychange", sendHeartbeat);
    window.addEventListener("focus", sendHeartbeat);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", sendHeartbeat);
      window.removeEventListener("focus", sendHeartbeat);
    };
  }, [session?.user?.id]);

  return null;
}

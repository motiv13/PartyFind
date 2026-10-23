"use client";

import FriendRequestButton from "@/components/profile/FriendRequestButton";
import MessageButton from "@/components/profile/MessageButton";
import PartyInviteButton from "@/components/profile/PartyInviteButton";
import { useLanguage } from "@/lib/i18n";

export default function ProfileActions({ playerId, playerGame }: { playerId: string | number; playerGame: string }) {
  const { t } = useLanguage();
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-8">

      <h2 className="mb-6 text-xl font-bold text-white sm:text-2xl">
        {t("Actions")}
      </h2>

      <div className="space-y-4">

        <MessageButton playerId={playerId} />

        <FriendRequestButton playerId={playerId} />

        <PartyInviteButton playerId={playerId} playerGame={playerGame} />

      </div>

    </section>
  );
}

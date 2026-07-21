import type { Player } from "@/types/player";
import { MessageSquareMore } from "lucide-react";

type ProfileContactProps = {
  player: Player;
};

export default function ProfileContact({
  player,
}: ProfileContactProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-blue-600/20 p-3">
          <MessageSquareMore
            size={22}
            className="text-blue-400"
          />
        </div>

        <h2 className="text-2xl font-bold text-white">
          Contact
        </h2>
      </div>

      <div className="space-y-4">

        <div className="rounded-xl bg-zinc-800 p-4">
          <p className="text-sm text-zinc-400">
            Discord
          </p>

          <p className="mt-1 font-medium text-white">
            {player.discord}
          </p>
        </div>

      </div>
    </section>
  );
}
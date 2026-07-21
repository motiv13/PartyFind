import type { Player } from "@/types/player";
import { Gamepad2 } from "lucide-react";

type ProfileGamesProps = {
  player: Player;
};

export default function ProfileGames({
  player,
}: ProfileGamesProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <div className="mb-6 flex items-center gap-3">

        <div className="rounded-xl bg-blue-600/20 p-3">
          <Gamepad2
            size={22}
            className="text-blue-400"
          />
        </div>

        <h2 className="text-2xl font-bold text-white">
          Favorite Games
        </h2>

      </div>

      <div className="flex flex-wrap gap-3">

        {player.favoriteGames.map((game) => (
          <div
            key={game}
            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2 transition-all duration-300 hover:border-blue-500 hover:bg-zinc-700"
          >
            <span className="text-zinc-200">
              🎮 {game}
            </span>
          </div>
        ))}

      </div>

    </section>
  );
}
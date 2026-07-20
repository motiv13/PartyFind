import PlayerCard from "./PlayerCard";
import { players } from "@/data/player";

type PlayersGridProps = {
  search: string;
  selectedGame: string;
  onlineOnly: boolean;
};

export default function PlayersGrid({
  search,
  selectedGame,
  onlineOnly,
}: PlayersGridProps) {
  const filteredPlayers = players.filter((player) => {
    const value = search.toLowerCase();

    const matchesSearch =
      player.name.toLowerCase().includes(value) ||
      player.game.toLowerCase().includes(value) ||
      player.role.toLowerCase().includes(value) ||
      player.country.toLowerCase().includes(value);

    const matchesGame =
      selectedGame === "All" ||
      player.game === selectedGame;

    const matchesOnline =
      !onlineOnly || player.online;

    return (
      matchesSearch &&
      matchesGame &&
      matchesOnline
    );
  });

  if (filteredPlayers.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 py-20 text-center">
        <h2 className="text-2xl font-bold text-white">
          No players found
        </h2>

        <p className="mt-3 text-zinc-400">
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {filteredPlayers.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
        />
      ))}
    </div>
  );
}
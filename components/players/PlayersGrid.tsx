import PlayerCard from "./PlayerCard";
import { players } from "@/data/player";

type PlayersGridProps = {
  search: string;
};

export default function PlayersGrid({ search }: PlayersGridProps) {
  const filteredPlayers = players.filter((player) => {
    const value = search.toLowerCase();

    return (
      player.name.toLowerCase().includes(value) ||
      player.game.toLowerCase().includes(value) ||
      player.role.toLowerCase().includes(value) ||
      player.country.toLowerCase().includes(value)
    );
  });

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
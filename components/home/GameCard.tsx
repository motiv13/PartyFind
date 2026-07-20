type GameCardProps = {
  emoji: string;
  name: string;
  players: string;
};

export default function GameCard({
  emoji,
  name,
  players,
}: GameCardProps) {
  return (
    <div className="bg-zinc-900 hover:bg-zinc-800 transition rounded-2xl p-6 border border-zinc-800 cursor-pointer">
      <div className="text-5xl mb-4">{emoji}</div>

      <h3 className="text-2xl font-bold text-white">
        {name}
      </h3>

      <p className="text-zinc-400 mt-2">
        {players} players
      </p>
    </div>
  );
}
import { games } from "@/data/games";

type FiltersProps = {
  selectedGame: string;
  setSelectedGame: (game: string) => void;

  onlineOnly: boolean;
  setOnlineOnly: (value: boolean) => void;
};

export default function Filters({
  selectedGame,
  setSelectedGame,
  onlineOnly,
  setOnlineOnly,
}: FiltersProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        {games.map((game) => (
          <button
            key={game}
            onClick={() => setSelectedGame(game)}
            className={`rounded-xl border px-5 py-3 transition-all duration-200 ${
              selectedGame === game
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-blue-500 hover:text-white"
            }`}
          >
            {game}
          </button>
        ))}
      </div>

      <button
        onClick={() => setOnlineOnly(!onlineOnly)}
        className={`flex items-center gap-3 rounded-xl border px-5 py-3 transition-all ${
          onlineOnly
            ? "border-green-500 bg-green-600 text-white"
            : "border-zinc-800 bg-zinc-900 text-zinc-400"
        }`}
      >
        <span className="text-lg">🟢</span>

        Online only
      </button>
    </div>
  );
}
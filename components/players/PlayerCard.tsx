import type { Player } from "@/types/player";
import { Circle, Gamepad2, Globe, Mic, Shield } from "lucide-react";

type PlayerCardProps = {
  player: Player;
};

export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-2">
          <Circle
            size={10}
            fill={player.online ? "#22c55e" : "#71717a"}
            className={player.online ? "text-green-500" : "text-zinc-500"}
          />

          <span
            className={`text-sm font-medium ${
              player.online ? "text-green-400" : "text-zinc-400"
            }`}
          >
            {player.online ? "Online" : "Offline"}
          </span>
        </div>

        <span className="rounded-full bg-blue-600/20 px-3 py-1 text-xs font-semibold text-blue-400">
          LFG
        </span>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center px-6 pt-8">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-bold text-white">
          {player.name.charAt(0)}
        </div>

        <h2 className="mt-5 text-2xl font-bold text-white">
          {player.name}
        </h2>

        <p className="mt-1 text-zinc-400">
          Looking for teammates
        </p>
      </div>

      {/* Information */}
      <div className="mt-8 space-y-4 px-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-blue-400" size={20} />
          <span className="text-zinc-300">{player.game}</span>
        </div>

        <div className="flex items-center gap-3">
          <Shield className="text-purple-400" size={20} />
          <span className="text-zinc-300">
            {player.role} • {player.ilvl ?? player.rank}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Globe className="text-emerald-400" size={20} />
          <span className="text-zinc-300">{player.country}</span>
        </div>

        <div className="flex items-center gap-3">
          <Mic className="text-yellow-400" size={20} />
          <span className="text-zinc-300">
            {player.voice ? "Discord Available" : "No Voice Chat"}
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-8 flex flex-wrap gap-2 px-6">
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          PvE
        </span>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          Team Player
        </span>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
          Voice Chat
        </span>
      </div>

      {/* Button */}
      <div className="p-6">
        <button className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/30">
          View Profile
        </button>
      </div>
    </div>
  );
}
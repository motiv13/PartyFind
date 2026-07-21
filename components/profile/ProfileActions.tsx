import {
  MessageCircle,
  UserPlus,
  Gamepad2,
} from "lucide-react";

export default function ProfileActions() {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

      <h2 className="mb-6 text-2xl font-bold text-white">
        Actions
      </h2>

      <div className="space-y-4">

        <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-all duration-300 hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99]">

          <MessageCircle size={20} />

          Message

        </button>

        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800 py-3 font-semibold text-white transition-all duration-300 hover:border-blue-500 hover:bg-zinc-700">

          <UserPlus size={20} />

          Add Friend

        </button>

        <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-green-500/40 bg-green-500/10 py-3 font-semibold text-green-300 transition-all duration-300 hover:bg-green-500/20">

          <Gamepad2 size={20} />

          Invite to Party

        </button>

      </div>

    </section>
  );
}
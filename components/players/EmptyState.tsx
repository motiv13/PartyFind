export default function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 p-10 text-center">
      <h3 className="text-xl font-semibold text-white">
        No players found
      </h3>

      <p className="mt-2 text-zinc-400">
        Try changing your filters or search query.
      </p>
    </div>
  );
}
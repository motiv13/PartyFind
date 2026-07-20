type SearchBarProps = {
  search: string;
  setSearch: (value: string) => void;
};

export default function SearchBar({
  search,
  setSearch,
}: SearchBarProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <input
        type="text"
        placeholder="Search players or games..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none transition focus:border-blue-500"
      />
    </div>
  );
}
type FilterSelectProps = {
  label: string;
  value: string;
  allLabel: string;
  options: string[];
  onChange: (value: string) => void;
};

export default function FilterSelect({ label, value, allLabel, options, onChange }: FilterSelectProps) {
  return (
    <label className="min-w-44 flex-1 text-xs font-medium text-zinc-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
      >
        <option value="All">{allLabel}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

import { X } from "lucide-react";

type MultiOptionPickerProps = {
  id: string;
  label: string;
  selected: string[];
  options: string[];
  placeholder: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
};

export default function MultiOptionPicker({ id, label, selected, options, placeholder, onAdd, onRemove }: MultiOptionPickerProps) {
  const availableOptions = options.filter((option) => !selected.includes(option));

  return (
    <div className="text-sm font-medium text-zinc-200">
      <label htmlFor={id}>{label}</label>
      <div className="mt-2 flex min-h-12 flex-wrap items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
        {selected.map((item) => (
          <span key={item} className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 py-1 pl-3 pr-1 text-xs font-medium text-blue-300">
            {item}
            <button type="button" onClick={() => onRemove(item)} aria-label={`Remove ${item}`} className="rounded-full p-1 transition hover:bg-blue-500/20 hover:text-white"><X size={13} /></button>
          </span>
        ))}
        <select
          id={id}
          value=""
          onChange={(event) => { if (event.target.value) onAdd(event.target.value); }}
          className="min-w-44 flex-1 bg-zinc-950 px-1 py-1 text-sm text-zinc-300 outline-none"
        >
          <option value="">{placeholder}</option>
          {availableOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>
    </div>
  );
}

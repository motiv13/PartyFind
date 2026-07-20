import FilterSelect from "./FilterSelect";

export default function Filters() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <FilterSelect />
      <FilterSelect />
      <FilterSelect />
      <FilterSelect />
    </div>
  );
}
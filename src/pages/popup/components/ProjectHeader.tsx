type ProjectHeaderProps = {
  onAdd: () => void;
  showAdd?: boolean;
  showSearch?: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
};

export default function ProjectHeader({
  onAdd,
  showAdd = true,
  showSearch = true,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Portfolio Workspace</p>
        <h1 className="text-xl font-semibold tracking-wide text-gray-100">Project Pal</h1>
        </div>
        {showAdd && (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-dashed border-gray-500 text-lg font-semibold text-gray-200 transition hover:border-gray-300 hover:bg-gray-800"
            onClick={onAdd}
            aria-label="Add project"
            title="Add project"
          >
            +
          </button>
        )}
      </div>
      {showSearch && (
        <div className="flex items-center gap-2">
          <input
            className="w-full rounded-xl border border-gray-800 bg-gray-950/60 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search projects"
          />
          <button
            className="rounded-xl border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
            onClick={onSearchSubmit}
          >
            Search
          </button>
        </div>
      )}
    </div>
  );
}

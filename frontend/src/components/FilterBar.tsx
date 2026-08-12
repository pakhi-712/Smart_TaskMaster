interface FilterBarProps {
  searchKeyword: string;
  onSearchChange: (value: string) => void;
  sortOption: string;
  onSortChange: (value: string) => void;
}

function FilterBar({
  searchKeyword,
  onSearchChange,
  sortOption,
  onSortChange,
}: FilterBarProps) {

  return (
    <div className="filter-bar">

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchKeyword && (
          <button className="clear-search" onClick={() => onSearchChange("")}>
            ✕
          </button>
        )}
      </div>

      <select
        className="sort-select"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="priority">Priority Order</option>
        <option value="due-date">Due Date Order</option>
      </select>
    </div>
  );
}

export default FilterBar;
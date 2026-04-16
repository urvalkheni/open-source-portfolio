function FilterTabs({ items, activeFilter, onChange }) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Contribution filters">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          className={`filter-tabs__button ${
            activeFilter === item.value ? "is-active" : ""
          }`.trim()}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default FilterTabs;

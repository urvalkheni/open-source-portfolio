import { useMemo, useState } from "react";

export function useContributionFilter(items) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") {
      return items;
    }

    return items.filter((item) => item.statusKey === activeFilter);
  }, [activeFilter, items]);

  return {
    activeFilter,
    setActiveFilter,
    filteredItems,
  };
}

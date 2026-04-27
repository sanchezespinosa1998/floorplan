import { useState } from 'react';

export type FilterMode = 'text' | 'enum';

export interface ActiveFilter {
  mode: FilterMode;
  values: string[];
}

export type ColumnFilters = Record<string, ActiveFilter>;
export type ColumnFilterResolvers<T> = Record<string, (item: T) => string | number | null | undefined>;

export function useColumnFilters<T>() {
  const [filters, setFilters] = useState<ColumnFilters>({});

  const setFilter = (key: string, filter: ActiveFilter) => {
    setFilters(prev => ({ ...prev, [key]: filter }));
  };

  const clearFilter = (key: string) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const clearAll = () => setFilters({});

  const activeCount = Object.values(filters).filter(f => f.values.length > 0).length;

  /** Apply all active column filters to an array of items. */
  const applyFilters = (items: T[], resolvers: ColumnFilterResolvers<T>): T[] => {
    const active = Object.entries(filters).filter(([, f]) => f.values.length > 0);
    if (active.length === 0) return items;

    return items.filter(item =>
      active.every(([key, filter]) => {
        const resolver = resolvers[key];
        if (!resolver) return true;
        const raw = resolver(item);
        if (raw == null) return false;
        const strVal = String(raw).toLowerCase();

        if (filter.mode === 'text') {
          const q = (filter.values[0] ?? '').toLowerCase();
          return !q || strVal.includes(q);
        }
        // enum: item value must be one of the selected options
        return filter.values.some(v => v.toLowerCase() === strVal);
      }),
    );
  };

  return { filters, setFilter, clearFilter, clearAll, activeCount, applyFilters };
}

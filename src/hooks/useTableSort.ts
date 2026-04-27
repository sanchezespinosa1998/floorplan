import { useState, useMemo, useRef } from 'react';

export type SortDir = 'asc' | 'desc';

export type SortResolver<T> = (item: T, key: string) => string | number | null | undefined;

export interface UseTableSortReturn<T> {
  sortedItems: T[];
  sortKey: string | null;
  sortDir: SortDir;
  handleSort: (key: string) => void;
}

export function useTableSort<T>(
  items: T[],
  resolve: SortResolver<T>,
): UseTableSortReturn<T> {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Keep resolve stable without requiring useCallback at every call site
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortKey) return items;
    return [...items].sort((a, b) => {
      const aVal = resolveRef.current(a, sortKey);
      const bVal = resolveRef.current(b, sortKey);
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      let result: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        result = aVal - bVal;
      } else {
        result = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
      }
      return sortDir === 'asc' ? result : -result;
    });
  // resolveRef.current is intentionally excluded — it's always up-to-date via the ref
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sortKey, sortDir]);

  return { sortedItems, sortKey, sortDir, handleSort };
}

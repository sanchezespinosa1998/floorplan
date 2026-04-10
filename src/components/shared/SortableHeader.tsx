import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import type { SortDir } from '@/hooks/useTableSort';

interface SortProps {
  label: string;
  sortKey: string;
  currentSortKey: string | null;
  currentSortDir: SortDir;
  onSort: (key: string) => void;
  /** Optional filter control rendered after the sort button. */
  filterPopover?: ReactNode;
}

/** Inline button — embed inside any <th> wrapper (e.g. shadcn TableHead). */
export function SortButton({ label, sortKey, currentSortKey, currentSortDir, onSort, filterPopover }: SortProps) {
  const isActive = currentSortKey === sortKey;
  const Icon = isActive
    ? currentSortDir === 'asc' ? ChevronUp : ChevronDown
    : ChevronsUpDown;

  return (
    <span className="inline-flex items-center gap-1">
      <button
        onClick={() => onSort(sortKey)}
        className={`inline-flex items-center gap-1 hover:text-foreground transition-colors whitespace-nowrap ${
          isActive ? 'text-foreground' : ''
        }`}
      >
        {label}
        <Icon className={`h-3 w-3 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground/50'}`} />
      </button>
      {filterPopover}
    </span>
  );
}

interface SortableHeaderProps extends SortProps {
  /** Full class string for the <th> element. */
  className: string;
}

/** Full <th> element with built-in sort button (and optional filter button). */
export function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortDir,
  onSort,
  filterPopover,
  className,
}: SortableHeaderProps) {
  return (
    <th className={className}>
      <SortButton
        label={label}
        sortKey={sortKey}
        currentSortKey={currentSortKey}
        currentSortDir={currentSortDir}
        onSort={onSort}
        filterPopover={filterPopover}
      />
    </th>
  );
}

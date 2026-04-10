import { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ActiveFilter, FilterMode } from '@/hooks/useColumnFilters';

interface ColumnFilterButtonProps {
  columnKey: string;
  mode: FilterMode;
  /** Raw option values shown as checkboxes in enum mode. */
  enumOptions?: string[];
  /** Optional display labels for enum options: { rawValue: 'Display Label' }. */
  optionLabels?: Record<string, string>;
  currentFilter?: ActiveFilter;
  onFilter: (key: string, filter: ActiveFilter) => void;
  onClear: (key: string) => void;
}

export function ColumnFilterButton({
  columnKey,
  mode,
  enumOptions = [],
  optionLabels,
  currentFilter,
  onFilter,
  onClear,
}: ColumnFilterButtonProps) {
  const [textValue, setTextValue] = useState(currentFilter?.mode === 'text' ? (currentFilter.values[0] ?? '') : '');

  // Reset text input when filter is cleared externally
  useEffect(() => {
    if (!currentFilter || currentFilter.values.length === 0) {
      setTextValue('');
    }
  }, [currentFilter]);

  const isActive = !!(currentFilter?.values.length);

  const handleTextChange = (value: string) => {
    setTextValue(value);
    if (!value.trim()) {
      onClear(columnKey);
    } else {
      onFilter(columnKey, { mode: 'text', values: [value] });
    }
  };

  const handleEnumToggle = (value: string) => {
    const current = currentFilter?.mode === 'enum' ? currentFilter.values : [];
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    if (next.length === 0) {
      onClear(columnKey);
    } else {
      onFilter(columnKey, { mode: 'enum', values: next });
    }
  };

  const selectedEnumValues = currentFilter?.mode === 'enum' ? currentFilter.values : [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Filtrar"
          onClick={e => e.stopPropagation()}
          className={`inline-flex items-center justify-center rounded p-0.5 transition-colors ${
            isActive
              ? 'text-primary bg-primary/15'
              : 'text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted'
          }`}
        >
          <Filter className="h-3 w-3" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-52 p-0"
        align="start"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Filtrar
          </span>
          {isActive && (
            <button
              onClick={() => { onClear(columnKey); setTextValue(''); }}
              className="flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
        </div>

        {/* Filter body */}
        {mode === 'text' ? (
          <div className="p-2">
            <input
              autoFocus
              type="text"
              value={textValue}
              onChange={e => handleTextChange(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ) : (
          <div className="max-h-52 overflow-y-auto py-1">
            {enumOptions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Sin opciones disponibles</p>
            ) : (
              enumOptions.map(opt => {
                const label = optionLabels?.[opt] ?? opt;
                const checked = selectedEnumValues.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-muted transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleEnumToggle(opt)}
                      className="h-3.5 w-3.5 rounded accent-primary"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

import { Search, X } from "lucide-react";

interface TableSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export function TableSearchBar({ value, onChange, placeholder = "Buscar en tabla...", resultCount }: TableSearchBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/20">
      <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
      />
      {resultCount !== undefined && (
        <span className="text-xs text-muted-foreground shrink-0">{resultCount} result{resultCount !== 1 ? "s" : ""}</span>
      )}
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

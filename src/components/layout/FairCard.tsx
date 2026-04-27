import { useState, useMemo } from "react";
import { Search, ChevronDown, CalendarDays, Calendar } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export function FairCard() {
  const { activeFair, availableFairs, setActiveFairId, activeFairId, isRole } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredFairs = useMemo(() => {
    if (!search) return availableFairs;
    const lower = search.toLowerCase();
    return availableFairs.filter(
      f => f.name.toLowerCase().includes(lower) || f.edition.toLowerCase().includes(lower)
    );
  }, [availableFairs, search]);

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (isRole("organizer")) return;
          setIsOpen(!isOpen);
        }}
        className={cn(
          "flex min-w-[240px] items-center gap-[8.19px] border border-border px-[12.8px] py-[8.19px] transition-colors",
          activeFair
            ? "bg-primary-surface text-primary hover:border-primary"
            : "bg-card hover:border-primary"
        )}
        aria-label="Select active fair"
      >
        <div className={cn(
          "flex h-[31.25px] w-[31.25px] shrink-0 items-center justify-center border border-border",
          activeFair ? "border-primary bg-primary-surface" : "bg-card"
        )}>
          <CalendarDays className={cn("h-4 w-4", activeFair ? "text-primary" : "text-muted-foreground")} />
        </div>
        
        <div className="flex-1 text-left min-w-0">
          {activeFair ? (
            <>
              <p className="truncate text-[12.8px] font-bold text-foreground">{activeFair.name} {activeFair.edition}</p>
              <p className="truncate text-[12.8px] text-muted-foreground">
                {new Date(activeFair.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - {new Date(activeFair.endDate).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </>
          ) : (
            <>
              <p className="text-[12.8px] font-medium text-muted-foreground">Select fair</p>
              <p className="text-[10px] text-muted-foreground/70">No active fair</p>
            </>
          )}
        </div>

        <ChevronDown className={cn(
          "h-4 w-4 shrink-0 transition-transform",
          activeFair ? "text-primary" : "text-muted-foreground",
          isRole("organizer") && "opacity-40",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && !isRole("organizer") && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-[6.55px] min-w-[300px] overflow-hidden border border-border bg-card">
            <div className="relative border-b border-border bg-secondary px-[8.19px] py-[8.19px]">
              <Search className="pointer-events-none absolute left-[24px] top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search fair..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-[39.06px]"
                autoFocus
              />
            </div>
            
            <div className="max-h-64 overflow-y-auto p-[8.19px]">
              <button
                onClick={() => {
                  setActiveFairId(null);
                  setIsOpen(false);
                  setSearch("");
                }}
                className="flex w-full items-center gap-[8.19px] border border-transparent px-[12.8px] py-[8.19px] text-left text-[12.8px] text-muted-foreground transition-colors hover:border-border hover:bg-secondary"
              >
                <span className="text-[12.8px] italic">No active fair</span>
              </button>
              
              {filteredFairs.map(fair => (
                <button
                  key={fair.id}
                  onClick={() => {
                    setActiveFairId(fair.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "flex w-full items-start gap-[8.19px] border px-[12.8px] py-[8.19px] text-left transition-colors",
                    activeFairId === fair.id
                      ? "border-primary bg-primary-surface"
                      : "border-transparent hover:border-border hover:bg-secondary"
                  )}
                >
                  <div className="mt-[3.36px] flex h-[31.25px] w-[31.25px] shrink-0 items-center justify-center border border-border bg-card">
                    <CalendarDays className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12.8px] font-semibold text-foreground">{fair.name} {fair.edition}</p>
                    <div className="mt-[5.24px] flex items-center gap-[5.24px] text-[12.8px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span className="truncate">
                        {new Date(fair.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })} - {new Date(fair.endDate).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredFairs.length === 0 && search && (
                <p className="px-[12.8px] py-[12.8px] text-center text-[12.8px] text-muted-foreground">No se encontraron ferias</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import {
  Search, LogOut, ChevronDown, Palette, LayoutGrid,
  Wallet, CreditCard, ArrowLeftRight, Receipt, LineChart, Bitcoin,
  Landmark, ShieldCheck, Target, Briefcase, Building2, Users,
} from "lucide-react";
import { bookings, roleLabels } from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ModuleEntry {
  id: string;
  label: string;
  description: string;
  to: string;
  icon: typeof Wallet;
  group: 'Banking' | 'Investing' | 'Lifestyle' | 'Operations';
}

const moduleCatalog: ModuleEntry[] = [
  // Banking
  { id: 'accounts',     label: 'Accounts',          description: 'Multi-currency current, savings, brokerage and pension accounts', to: '/accounts',     icon: Wallet,         group: 'Banking' },
  { id: 'cards',        label: 'Cards',             description: 'Debit, credit and virtual cards · spend limits, freeze, Apple Pay', to: '/cards',        icon: CreditCard,     group: 'Banking' },
  { id: 'transactions', label: 'Transactions',      description: 'Unified ledger across accounts and cards with categorisation',  to: '/transactions', icon: Receipt,        group: 'Banking' },
  { id: 'transfers',    label: 'Transfers & FX',    description: 'SEPA, SWIFT, P2P and recurring transfers with FX',               to: '/transfers',    icon: ArrowLeftRight, group: 'Banking' },
  // Investing
  { id: 'portfolios',   label: 'Portfolios',        description: 'Investment portfolios across mandates · holdings and rebalances', to: '/fairs',        icon: Briefcase,      group: 'Investing' },
  { id: 'mandates',     label: 'Mandates',          description: 'Top-level investment mandates · AUM, strategies, governance',    to: '/venues',       icon: Building2,      group: 'Investing' },
  { id: 'markets',      label: 'Markets & Watchlist', description: 'Indices, watchlist, sector heatmap and macro news',            to: '/markets',      icon: LineChart,      group: 'Investing' },
  { id: 'crypto',       label: 'Crypto',            description: 'Crypto wallet, spot trades and staking yields',                   to: '/crypto',       icon: Bitcoin,        group: 'Investing' },
  // Lifestyle
  { id: 'lending',      label: 'Lending',           description: 'Mortgage, auto, BNPL, personal loans and credit score',           to: '/lending',      icon: Landmark,       group: 'Lifestyle' },
  { id: 'insurance',    label: 'Insurance',         description: 'Health, life, home, auto and travel policies & claims',           to: '/insurance',    icon: ShieldCheck,    group: 'Lifestyle' },
  { id: 'goals',        label: 'Goals & Wealth',    description: 'Savings goals, retirement projection and net-worth tracking',     to: '/goals',        icon: Target,         group: 'Lifestyle' },
  // Operations
  { id: 'users',        label: 'Users',             description: 'Team members, role assignments and access control',                to: '/users',        icon: Users,          group: 'Operations' },
];

interface QuickResult {
  id: string;
  title: string;
  subtitle: string;
  to: string;
  tag: "Portfolio" | "Order";
}

export function DashboardTopBar() {
  const navigate = useNavigate();
  const { activeUser, activeFair, availableFairs, logout } = useProfile();
  const { themeMode, setThemeMode, themeOptions } = useTheme();
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPlanMenuOpen, setIsPlanMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const closePlanMenuTimerRef = useRef<number | null>(null);
  const closeThemeMenuTimerRef = useRef<number | null>(null);

  const quickResults = useMemo<QuickResult[]>(() => {
    const searchTerm = query.trim().toLowerCase();
    if (!searchTerm) return [];

    const allowedFairIds = new Set(availableFairs.map((fair) => fair.id));

    const fairResults: QuickResult[] = availableFairs
      .filter((fair) =>
        fair.name.toLowerCase().includes(searchTerm) ||
        fair.edition.toLowerCase().includes(searchTerm) ||
        fair.venueName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4)
      .map((fair) => ({
        id: `fair-${fair.id}`,
        title: `${fair.name} ${fair.edition}`,
        subtitle: fair.venueName,
        to: `/fairs/${fair.id}`,
        tag: "Portfolio",
      }));

    const bookingResults: QuickResult[] = bookings
      .filter((booking) => allowedFairIds.has(booking.fairId))
      .filter((booking) =>
        booking.standCode.toLowerCase().includes(searchTerm) ||
        booking.company.toLowerCase().includes(searchTerm) ||
        booking.fairName.toLowerCase().includes(searchTerm)
      )
      .slice(0, 4)
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title: `${booking.standCode} · ${booking.company}`,
        subtitle: booking.fairName,
        to: `/fairs/${booking.fairId}/bookings`,
        tag: "Order",
      }));

    return [...fairResults, ...bookingResults].slice(0, 8);
  }, [availableFairs, query]);

  const openSearchResult = (result: QuickResult) => {
    navigate(result.to);
    setQuery("");
    setIsSearchOpen(false);
  };

  useEffect(() => {
    return () => {
      if (closePlanMenuTimerRef.current !== null) {
        window.clearTimeout(closePlanMenuTimerRef.current);
      }

      if (closeThemeMenuTimerRef.current !== null) {
        window.clearTimeout(closeThemeMenuTimerRef.current);
      }
    };
  }, []);

  const openPlanMenu = () => {
    if (closePlanMenuTimerRef.current !== null) {
      window.clearTimeout(closePlanMenuTimerRef.current);
      closePlanMenuTimerRef.current = null;
    }
    setIsPlanMenuOpen(true);
  };

  const closePlanMenu = () => {
    if (closePlanMenuTimerRef.current !== null) {
      window.clearTimeout(closePlanMenuTimerRef.current);
    }
    closePlanMenuTimerRef.current = window.setTimeout(() => {
      setIsPlanMenuOpen(false);
    }, 110);
  };

  const openThemeMenu = () => {
    if (closeThemeMenuTimerRef.current !== null) {
      window.clearTimeout(closeThemeMenuTimerRef.current);
      closeThemeMenuTimerRef.current = null;
    }
    setIsThemeMenuOpen(true);
  };

  const closeThemeMenu = () => {
    if (closeThemeMenuTimerRef.current !== null) {
      window.clearTimeout(closeThemeMenuTimerRef.current);
    }
    closeThemeMenuTimerRef.current = window.setTimeout(() => {
      setIsThemeMenuOpen(false);
    }, 110);
  };

  const activeThemeLabel = themeOptions.find((option) => option.id === themeMode)?.label ?? "Theme";
  const activeTheme = themeOptions.find((option) => option.id === themeMode) ?? themeOptions[0];
  const userInitials = activeUser.name
    .split(" ")
    .map((chunk) => chunk[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const activeFairLabel = activeFair ? `${activeFair.name} · ${activeFair.edition}` : "Firm-wide view";

  return (
    <header className="shrink-0 bg-[#0a0a0a]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 items-center gap-2">
          <div className="ui-hover-lift flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#8fee00] bg-[#141414]">
            <div className="h-2 w-2 rounded-full bg-[#8fee00]" />
          </div>
          <p className="text-[20px] font-bold leading-none text-[#fafafa]">PortfolioMap</p>
        </div>
        <div className="ui-hover-outline ui-interactive-base ui-theme-card flex min-h-[52px] flex-1 items-center gap-2 rounded-[10.24px] border border-[#2f4310] px-3 py-2 sm:gap-3">
          <div className="ui-hover-lift flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#2f4310] bg-[#141414] text-[12px] font-extrabold text-[#8fee00]">
            {userInitials}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12.8px] font-bold uppercase tracking-[0.6px] text-[#fafafa]">
              {activeUser.name}
            </p>
            <p className="truncate text-[10.24px] font-medium text-[#9a9a9a]">
              {activeFairLabel}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline-flex h-7 items-center rounded-[8px] border border-[#2f4310] bg-[#1d260f] px-2.5 text-[10px] font-bold uppercase tracking-[0.8px] text-[#8fee00]">
              {roleLabels[activeUser.role]}
            </span>

            <button
              type="button"
              onClick={logout}
              aria-label="Sign out"
              className="ui-hover-accent ui-interactive-base inline-flex h-9 min-w-9 items-center justify-center gap-[5.24px] rounded-[8px] border border-[#2f4310] bg-[#141414] px-2 text-[10.24px] font-semibold text-[#8fee00] sm:h-7 sm:px-3"
            >
              <LogOut className="h-[14px] w-[14px] sm:h-[11px] sm:w-[11px]" />
              <span className="hidden sm:inline">SIGN OUT</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:flex-1">
          <div className="ui-focus-panel ui-interactive-base relative flex h-[52px] flex-1 items-center gap-[10.24px] rounded-[8.19px] border border-[#2f4310] bg-[#101010] px-4">
            <Search className="h-[10px] w-[10px] shrink-0 text-[#8fee00]" />
            <input
              type="text"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => {
                window.setTimeout(() => setIsSearchOpen(false), 120);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setIsSearchOpen(false);
                }

                if (event.key === "Enter" && quickResults.length > 0) {
                  event.preventDefault();
                  openSearchResult(quickResults[0]);
                }
              }}
              placeholder="Search portfolios, trade orders, tickers…"
              aria-label="Search"
              className="w-full bg-transparent text-[12.8px] font-extralight text-[#8fee00] outline-none placeholder:text-[#8fee00]"
            />

            {isSearchOpen && query.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[8.19px] border border-[#333333] bg-[#141414] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)]">
                <div className="max-h-72 overflow-auto p-1.5">
                  {quickResults.length > 0 ? (
                    quickResults.map((result) => (
                      <button
                        key={result.id}
                        onMouseDown={() => openSearchResult(result)}
                        className="ui-hover-surface ui-interactive-base w-full rounded-[6.55px] border border-transparent px-2.5 py-2 text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[12.8px] font-semibold text-[#fafafa]">{result.title}</p>
                          <span className={cn(
                            "rounded-[6.55px] border px-1.5 py-0.5 text-[10px] font-bold",
                            result.tag === "Portfolio"
                              ? "border-[#8fee00] bg-[#2f4310] text-[#8fee00]"
                              : "border-[#f97316] bg-[#22140b] text-[#f97316]"
                          )}>
                            {result.tag}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10.24px] text-[#dadada]">{result.subtitle}</p>
                      </button>
                    ))
                  ) : (
                    <p className="px-2.5 py-2 text-[10.24px] text-[#dadada]">No matches found.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          

          <div className="flex shrink-0 items-center gap-2">
            <div
              className="relative flex-1 sm:flex-none"
              onMouseEnter={openThemeMenu}
              onMouseLeave={closeThemeMenu}
            >
              <button
                type="button"
                onFocus={openThemeMenu}
                onBlur={closeThemeMenu}
                onClick={() => setIsThemeMenuOpen((prev) => !prev)}
                aria-label={`Theme: ${activeThemeLabel}`}
                className="ui-hover-surface ui-interactive-base inline-flex h-[52px] w-full items-center justify-center gap-[6.55px] rounded-[10.24px] border border-[#333333] bg-[#141414] px-3 text-[12.8px] font-semibold text-[#fafafa] sm:w-auto sm:px-[12.8px]"
              >
                <Palette className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline truncate">{activeThemeLabel}</span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full border border-[#333333]" style={{ backgroundColor: activeTheme.preview.bg }} />
                  <span className="h-2 w-2 rounded-full border border-[#333333]" style={{ backgroundColor: activeTheme.preview.surface }} />
                  <span className="h-2 w-2 rounded-full border border-[#333333]" style={{ backgroundColor: activeTheme.preview.accent }} />
                </span>
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  isThemeMenuOpen && "rotate-180"
                )} />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-w-[calc(100vw-1rem)] overflow-hidden rounded-[8.19px] border border-[#333333] bg-[#141414] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)] sm:left-auto sm:right-0 sm:min-w-[260px]">
                  <div className="max-h-72 overflow-auto p-1.5">
                    {themeOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onMouseDown={() => {
                          setThemeMode(option.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={cn(
                          "ui-hover-surface ui-interactive-base w-full rounded-[6.55px] border px-2.5 py-2 text-left",
                          themeMode === option.id
                            ? "border-[#8fee00] bg-[#1d260f]"
                            : "border-transparent"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-[12.8px] font-semibold text-[#fafafa]">{option.label}</p>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-2.5 w-2.5 rounded-full border border-[#333333]" style={{ backgroundColor: option.preview.bg }} />
                            <span className="h-2.5 w-2.5 rounded-full border border-[#333333]" style={{ backgroundColor: option.preview.surface }} />
                            <span className="h-2.5 w-2.5 rounded-full border border-[#333333]" style={{ backgroundColor: option.preview.accent }} />
                          </span>
                        </div>
                        <p className="mt-1 truncate text-[10.24px] text-[#dadada]">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative flex-1 sm:flex-none"
              onMouseEnter={openPlanMenu}
              onMouseLeave={closePlanMenu}
            >
              <button
                type="button"
                onFocus={openPlanMenu}
                onBlur={closePlanMenu}
                onClick={() => setIsPlanMenuOpen((v) => !v)}
                aria-label="Open module launcher"
                className="ui-hover-accent ui-interactive-base inline-flex h-[52px] w-full shrink-0 items-center justify-center gap-[6.55px] rounded-[10.24px] border border-[#2f4310] bg-[#141414] px-3 text-[12.8px] font-semibold text-[#8fee00] sm:w-auto sm:px-[20px]"
              >
                <LayoutGrid className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Modules</span>
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 shrink-0 transition-transform duration-200",
                  isPlanMenuOpen && "rotate-180"
                )} />
              </button>

              {isPlanMenuOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-w-[calc(100vw-1rem)] overflow-hidden rounded-[8.19px] border border-[#333333] bg-[#141414] shadow-[0_4px_7.525px_rgba(0,0,0,0.75)] sm:left-auto sm:right-0 sm:w-[640px] sm:max-w-[640px]">
                  <div className="border-b border-[#2a2a2a] px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-[#8fee00]">PortfolioMap modules</p>
                    <p className="text-[10.24px] text-[#9a9a9a] mt-0.5">Pick any area of the platform — banking, investing, lifestyle and operations.</p>
                  </div>
                  <div className="max-h-[60dvh] overflow-auto p-2">
                    {(['Banking','Investing','Lifestyle','Operations'] as const).map((group) => (
                      <div key={group} className="mb-2 last:mb-0">
                        <p className="px-1.5 pt-1 pb-1.5 text-[9.5px] font-bold uppercase tracking-[1.2px] text-[#666]">
                          {group}
                        </p>
                        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                          {moduleCatalog.filter(m => m.group === group).map((mod) => {
                            const Icon = mod.icon;
                            return (
                              <button
                                key={mod.id}
                                type="button"
                                onMouseDown={() => {
                                  navigate(mod.to);
                                  setIsPlanMenuOpen(false);
                                }}
                                className="ui-hover-surface ui-interactive-base flex items-start gap-2 rounded-[6.55px] border border-transparent p-2 text-left hover:border-[#2f4310] hover:bg-[#1d260f]"
                              >
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] border border-[#2f4310] bg-[#101010] text-[#8fee00]">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[12px] font-semibold text-[#fafafa]">{mod.label}</p>
                                  <p className="mt-0.5 line-clamp-2 text-[10.24px] leading-[1.3] text-[#9a9a9a]">{mod.description}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
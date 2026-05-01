import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Download, ArrowUpRight, ArrowDownRight, ShoppingBag, Utensils, Train, Plane, Receipt, Briefcase, ArrowLeftRight, Home, Heart, Plug, Wallet, Ban } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { transactions, accounts, cards, type TxnCategory, type Transaction } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

const categoryIcon: Record<TxnCategory, typeof ShoppingBag> = {
  Groceries:     ShoppingBag,
  Restaurants:   Utensils,
  Transport:     Train,
  Travel:        Plane,
  Subscriptions: Receipt,
  Salary:        Briefcase,
  Investments:   Briefcase,
  Transfer:      ArrowLeftRight,
  Housing:       Home,
  Health:        Heart,
  Shopping:      ShoppingBag,
  Utilities:     Plug,
  Income:        Wallet,
  Fees:          Ban,
  Other:         Receipt,
};

function formatEUR(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const CATEGORIES = Array.from(new Set(transactions.map((t) => t.category))).sort();

export default function Transactions() {
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<"all" | "in" | "out">("all");
  const [category, setCategory] = useState<TxnCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions.filter((t) => {
      if (direction !== "all" && t.direction !== direction) return false;
      if (category !== "all" && t.category !== category) return false;
      if (!q) return true;
      return [t.merchant, t.category, t.notes ?? ""].join(" ").toLowerCase().includes(q);
    });
  }, [query, direction, category]);

  const inflow  = filtered.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const outflow = filtered.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const net     = inflow + outflow;
  const declined = filtered.filter((t) => t.status === "declined").length;

  // group by day
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const day = t.date.slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Banking"
        title="Transactions"
        description="Unified ledger across all accounts and cards. Search, filter and export by category, direction or merchant."
        actions={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Inflows (period)"  value={formatEUR(inflow)}     subtitle={`${filtered.filter((t) => t.amount > 0).length} transactions`} />
        <KpiCard title="Outflows (period)" value={formatEUR(outflow)}    subtitle={`${filtered.filter((t) => t.amount < 0).length} transactions`} />
        <KpiCard title="Net cashflow"      value={formatEUR(net)}        subtitle={net >= 0 ? "Positive" : "Negative"} />
        <KpiCard title="Declined"          value={declined}              subtitle="Review for fraud or limit issues" />
      </div>

      {/* Filters bar */}
      <div className="bg-card border border-border p-4 flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search merchant, category or notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "in", "out"] as const).map((d) => (
            <Button
              key={d}
              size="sm"
              variant={direction === d ? "default" : "outline"}
              onClick={() => setDirection(d)}
              className="capitalize text-xs h-9"
            >
              {d === "all" ? "All" : d === "in" ? "Inflow" : "Outflow"}
            </Button>
          ))}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TxnCategory | "all")}
            className="h-9 px-3 text-xs bg-background border border-border rounded-md"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <Button variant="outline" size="sm" className="gap-1.5 h-9">
            <Filter className="h-3.5 w-3.5" /> More
          </Button>
        </div>
      </div>

      {/* Grouped feed */}
      <div className="space-y-6">
        {groups.length === 0 && (
          <div className="bg-card border border-border p-10 text-center text-sm text-muted-foreground">
            No transactions match the current filters.
          </div>
        )}

        {groups.map(([day, items], gIndex) => (
          <motion.section
            key={day}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: gIndex * 0.04 }}
            className="bg-card border border-border"
          >
            <header className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-muted-foreground">
                {formatDate(day)}
              </p>
              <p className="text-[11px] tabular-nums text-muted-foreground">
                {items.reduce((s, t) => s + t.amount, 0) >= 0 ? "+" : ""}
                {formatEUR(items.reduce((s, t) => s + t.amount, 0))}
              </p>
            </header>
            <div className="divide-y divide-border">
              {items.map((t) => {
                const Icon = categoryIcon[t.category];
                const account = accounts.find((a) => a.id === t.accountId);
                const card = cards.find((c) => c.id === t.cardId);
                return (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className={cn(
                      "h-9 w-9 rounded-md border flex items-center justify-center shrink-0",
                      t.direction === "in"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                        : t.status === "declined"
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-500"
                          : "border-border bg-secondary text-foreground"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{t.merchant}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {t.category}
                        {card && <> · •••• {card.lastFour}</>}
                        {!card && account && <> · {account.name}</>}
                        {t.countryCode && <> · {t.countryCode}</>}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn(
                        "text-sm font-semibold tabular-nums",
                        t.amount > 0 ? "text-emerald-500" : "text-foreground",
                        t.status === "declined" && "line-through text-muted-foreground"
                      )}>
                        {t.amount > 0 ? "+" : ""}{formatEUR(t.amount)}
                      </p>
                      {t.status !== "posted" && (
                        <p className={cn(
                          "text-[10px] uppercase tracking-wider font-bold",
                          t.status === "pending" ? "text-amber-500" : "text-rose-500"
                        )}>
                          {t.status}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}

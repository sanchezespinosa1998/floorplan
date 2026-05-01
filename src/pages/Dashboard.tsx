import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, Briefcase, Bitcoin,
  CreditCard, Receipt, ArrowLeftRight, LineChart, Landmark, ShieldCheck, Target,
  TrendingUp, TrendingDown,
} from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import {
  accounts, transactions, marketIndices, watchlist, goals,
  loans, insurancePolicies, cryptoHoldings, totalCryptoEUR,
  personalNetWorthEUR, totalLiabilitiesEUR, monthlyCashflowEUR,
} from "@/data/fintechMockData";
import { useProfile } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";

function formatEUR(value: number, options?: { compact?: boolean }) {
  if (options?.compact && Math.abs(value) >= 1_000_000) return `€${(value / 1_000_000).toFixed(1)} M`;
  if (options?.compact && Math.abs(value) >= 10_000)    return `€${(value / 1_000).toFixed(0)} k`;
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

const QUICK_LINKS = [
  { to: "/transfers",    label: "New transfer",     icon: ArrowLeftRight },
  { to: "/transactions", label: "Recent activity",  icon: Receipt        },
  { to: "/cards",        label: "Manage cards",     icon: CreditCard     },
  { to: "/markets",      label: "Open markets",     icon: LineChart      },
];

export default function Dashboard() {
  const { activeUser } = useProfile();
  const [hideAmounts, setHideAmounts] = useState(false);

  const liquidEUR     = accounts.filter((a) => a.kind === "current" || a.kind === "savings").reduce((s, a) => s + a.balanceEUR, 0);
  const investedEUR   = accounts.filter((a) => a.kind === "brokerage" || a.kind === "pension").reduce((s, a) => s + a.balanceEUR, 0);
  const monthlyChange = accounts.reduce((s, a) => s + a.monthlyChange, 0);

  const recentTxn = transactions.slice(0, 6);
  const topMovers = useMemo(() =>
    [...watchlist].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct)).slice(0, 5),
    []);

  const display = (v: number, opts?: { compact?: boolean }) => hideAmounts ? "••••" : formatEUR(v, opts);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow={`Welcome back, ${activeUser.name.split(" ")[0]}`}
        title="Your financial cockpit"
        description="One-pane view across banking, investing and lifestyle. Drill down with the Modules launcher in the topbar."
        actions={
          <Button variant="outline" size="sm" onClick={() => setHideAmounts((v) => !v)}>
            {hideAmounts ? "Show amounts" : "Hide amounts"}
          </Button>
        }
      />

      {/* Hero KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Personal net worth" value={display(personalNetWorthEUR, { compact: true })} subtitle={`Liabilities ${display(totalLiabilitiesEUR, { compact: true })}`} />
        <KpiCard title="Liquid balance"     value={display(liquidEUR)}                              subtitle="Current + savings, EUR equivalent" />
        <KpiCard title="Invested capital"   value={display(investedEUR, { compact: true })}        subtitle={`Brokerage + pension`} />
        <KpiCard title="30-day cashflow"    value={display(monthlyCashflowEUR)}                    subtitle={monthlyCashflowEUR >= 0 ? "Positive" : "Negative"} />
      </div>

      {/* Modules tile grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {QUICK_LINKS.map((q) => (
          <Link
            key={q.to}
            to={q.to}
            className="bg-card border border-border p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors flex flex-col items-start gap-2"
          >
            <div className="h-9 w-9 rounded-md border border-border bg-secondary flex items-center justify-center">
              <q.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground">{q.label}</p>
          </Link>
        ))}
        <Link to="/goals" className="bg-card border border-border p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors flex flex-col items-start gap-2">
          <div className="h-9 w-9 rounded-md border border-border bg-secondary flex items-center justify-center">
            <Target className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs font-semibold text-foreground">Track goals</p>
        </Link>
        <Link to="/lending" className="bg-card border border-border p-4 hover:border-primary/40 hover:bg-muted/40 transition-colors flex flex-col items-start gap-2">
          <div className="h-9 w-9 rounded-md border border-border bg-secondary flex items-center justify-center">
            <Landmark className="h-4 w-4 text-primary" />
          </div>
          <p className="text-xs font-semibold text-foreground">Loans & credit</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts overview */}
        <section className="lg:col-span-2 bg-card border border-border overflow-hidden">
          <header className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Accounts overview</h2>
            <Link to="/accounts" className="text-xs text-primary hover:underline">Open accounts →</Link>
          </header>
          <div className="divide-y divide-border">
            {accounts.slice(0, 6).map((a, i) => {
              const Icon = a.kind === "current" ? Wallet : a.kind === "savings" ? PiggyBank : a.kind === "brokerage" ? Briefcase : a.kind === "crypto" ? Bitcoin : ShieldCheck;
              const positive = a.monthlyChange >= 0;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-9 w-9 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                    <p className="text-[11px] text-muted-foreground capitalize">{a.kind} · {a.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{display(a.balanceEUR, { compact: a.kind === "brokerage" })}</p>
                    <p className={cn(
                      "text-[11px] tabular-nums font-medium flex items-center justify-end gap-0.5",
                      positive ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {hideAmounts ? "••" : `${formatEUR(Math.abs(a.monthlyChange), { compact: true })}`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Markets snapshot */}
        <section className="bg-card border border-border overflow-hidden">
          <header className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Markets</h2>
            <Link to="/markets" className="text-xs text-primary hover:underline">Open →</Link>
          </header>
          <div className="divide-y divide-border">
            {marketIndices.slice(0, 6).map((idx) => (
              <div key={idx.id} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                <div className="min-w-0">
                  <p className="text-sm text-foreground truncate">{idx.name}</p>
                  <p className="text-[10px] text-muted-foreground">{idx.region}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold tabular-nums">{idx.level.toLocaleString("en-GB", { maximumFractionDigits: 2 })}</p>
                  <p className={cn(
                    "text-[11px] tabular-nums font-medium",
                    idx.changePct >= 0 ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {idx.changePct >= 0 ? "+" : ""}{idx.changePct.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <section className="lg:col-span-2 bg-card border border-border overflow-hidden">
          <header className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Recent activity</h2>
            <Link to="/transactions" className="text-xs text-primary hover:underline">All transactions →</Link>
          </header>
          <div className="divide-y divide-border">
            {recentTxn.map((t) => {
              const account = accounts.find((a) => a.id === t.accountId);
              return (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                  <div className={cn(
                    "h-9 w-9 rounded-md border flex items-center justify-center shrink-0",
                    t.amount > 0 ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-border bg-secondary text-foreground"
                  )}>
                    {t.amount > 0 ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.merchant}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.category} · {account?.name}</p>
                  </div>
                  <p className={cn(
                    "text-sm font-semibold tabular-nums shrink-0",
                    t.amount > 0 ? "text-emerald-500" : "text-foreground"
                  )}>
                    {hideAmounts ? "•••" : `${t.amount > 0 ? "+" : ""}${formatEUR(t.amount)}`}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Goals + lifestyle summary */}
        <section className="bg-card border border-border p-5 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Goals & lifestyle</h2>
          </header>

          <div className="space-y-3">
            {goals.slice(0, 3).map((g) => {
              const pct = (g.current / g.target) * 100;
              return (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground truncate">{g.label}</span>
                    <span className="font-semibold tabular-nums shrink-0">{display(g.current, { compact: true })}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <Link to="/goals" className="text-xs text-primary hover:underline inline-block">All goals →</Link>
          </div>

          <div className="pt-4 border-t border-border grid grid-cols-3 gap-2 text-center">
            <Link to="/crypto" className="block hover:bg-muted/30 transition-colors py-2">
              <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Crypto</p>
              <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{display(totalCryptoEUR, { compact: true })}</p>
            </Link>
            <Link to="/lending" className="block hover:bg-muted/30 transition-colors py-2">
              <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Loans</p>
              <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{display(loans.reduce((s, l) => s + l.outstanding, 0), { compact: true })}</p>
            </Link>
            <Link to="/insurance" className="block hover:bg-muted/30 transition-colors py-2">
              <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Coverage</p>
              <p className="text-sm font-bold text-foreground tabular-nums mt-0.5">{display(insurancePolicies.reduce((s, p) => s + p.coverageEUR, 0), { compact: true })}</p>
            </Link>
          </div>
        </section>
      </div>

      {/* Top movers */}
      <section className="bg-card border border-border overflow-hidden">
        <header className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">Top movers — your watchlist</h2>
          <Link to="/markets" className="text-xs text-primary hover:underline">Open watchlist →</Link>
        </header>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y lg:divide-y-0 divide-border">
          {topMovers.map((w) => (
            <div key={w.ticker} className="p-3.5 hover:bg-muted/30">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{w.ticker}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{w.name}</p>
                </div>
                {w.changePct >= 0
                  ? <TrendingUp className="h-4 w-4 text-emerald-500 shrink-0" />
                  : <TrendingDown className="h-4 w-4 text-rose-500 shrink-0" />}
              </div>
              <p className="text-base font-bold tabular-nums mt-2">
                {w.lastPrice >= 1000 ? w.lastPrice.toLocaleString("en-GB", { maximumFractionDigits: 0 }) : w.lastPrice.toFixed(2)}
                <span className="ml-1 text-[10px] text-muted-foreground">{w.currency}</span>
              </p>
              <p className={cn(
                "text-[11px] tabular-nums font-medium",
                w.changePct >= 0 ? "text-emerald-500" : "text-rose-500"
              )}>
                {w.changePct >= 0 ? "+" : ""}{w.changePct.toFixed(2)}%
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

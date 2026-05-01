import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Wallet, PiggyBank, Briefcase, Bitcoin, ShieldCheck, ArrowUpRight, ArrowDownRight, Eye, EyeOff } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { accounts, accountKindLabels, type AccountKind, transactions } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

const kindIcon = {
  current:   Wallet,
  savings:   PiggyBank,
  brokerage: Briefcase,
  crypto:    Bitcoin,
  pension:   ShieldCheck,
} as const;

function formatEUR(value: number, options?: { compact?: boolean }) {
  if (options?.compact && Math.abs(value) >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)} M`;
  }
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Accounts() {
  const [filterKind, setFilterKind] = useState<AccountKind | "all">("all");
  const [hideBalances, setHideBalances] = useState(false);

  const filtered = useMemo(() => {
    if (filterKind === "all") return accounts;
    return accounts.filter((a) => a.kind === filterKind);
  }, [filterKind]);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balanceEUR, 0);
  const totalLiquid = accounts.filter((a) => a.kind !== "brokerage" && a.kind !== "pension").reduce((sum, a) => sum + a.balanceEUR, 0);
  const totalChange = accounts.reduce((sum, a) => sum + a.monthlyChange, 0);
  const accountsByKind = (kind: AccountKind) => accounts.filter((a) => a.kind === kind).length;

  const renderBalance = (value: number) =>
    hideBalances ? "••••" : formatEUR(value);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Banking"
        title="Accounts"
        description="Multi-currency banking layer · current, savings, brokerage, crypto and pension accounts under one roof."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setHideBalances((v) => !v)} className="gap-1.5">
              {hideBalances ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {hideBalances ? "Show balances" : "Hide balances"}
            </Button>
            <Button size="sm">Open new account</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Aggregate balance" value={renderBalance(totalBalance)} subtitle="All accounts (EUR equivalent)" />
        <KpiCard title="Liquid assets" value={renderBalance(totalLiquid)} subtitle="Excl. brokerage & pension" />
        <KpiCard
          title="30-day change"
          value={renderBalance(totalChange)}
          subtitle="Net inflows minus outflows"
        />
        <KpiCard title="Total accounts" value={accounts.length} subtitle={`${accountsByKind("current")} current · ${accountsByKind("savings")} savings · ${accountsByKind("brokerage")} brokerage`} />
      </div>

      <Tabs value={filterKind} onValueChange={(v) => setFilterKind(v as AccountKind | "all")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
          <TabsTrigger value="brokerage">Brokerage</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="pension">Pension</TabsTrigger>
        </TabsList>

        <TabsContent value={filterKind} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((account, index) => {
              const Icon = kindIcon[account.kind];
              const isPositive = account.monthlyChange >= 0;
              return (
                <motion.article
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.25 }}
                  className="bg-card border border-border p-5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{account.name}</p>
                        <p className="text-[11px] text-muted-foreground">{accountKindLabels[account.kind]} · {account.provider}</p>
                      </div>
                    </div>
                    {account.primary && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-primary border border-primary/30 bg-primary/10 px-1.5 py-0.5">
                        Primary
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Available</p>
                    <p className="text-2xl font-bold text-foreground">{renderBalance(account.balanceEUR)}</p>
                    {account.currency !== "EUR" && (
                      <p className="text-[11px] text-muted-foreground">
                        Native: {hideBalances ? "••••" : `${account.balance.toLocaleString("en-GB")} ${account.currency}`}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                    <div>
                      <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">30-day Δ</p>
                      <p className={cn(
                        "text-sm font-semibold flex items-center gap-1",
                        isPositive ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {renderBalance(Math.abs(account.monthlyChange))}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">
                        {account.kind === "savings" ? "APY" : account.kind === "brokerage" ? "YTD" : account.kind === "pension" ? "TWR" : account.kind === "crypto" ? "Yield" : "Rate"}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{account.rateOrYield?.toFixed(2) ?? "—"}%</p>
                    </div>
                  </div>

                  {account.iban && (
                    <p className="mt-3 text-[10px] text-muted-foreground font-mono truncate">{account.iban}</p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">View</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">Transfer</Button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Mini activity feed scoped to accounts */}
      <div className="bg-card border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Latest movements</h2>
          <Button variant="ghost" size="sm" className="text-xs h-7">View all transactions</Button>
        </div>
        <div className="divide-y divide-border">
          {transactions.slice(0, 6).map((t) => {
            const account = accounts.find((a) => a.id === t.accountId);
            return (
              <div key={t.id} className="flex items-center gap-3 py-2.5">
                <div className={cn(
                  "h-8 w-8 rounded-md border border-border flex items-center justify-center shrink-0",
                  t.direction === "in" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/5 text-rose-500"
                )}>
                  {t.direction === "in" ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{t.merchant}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.category} · {account?.name ?? t.accountId}</p>
                </div>
                <p className={cn(
                  "text-sm font-semibold tabular-nums shrink-0",
                  t.amount > 0 ? "text-emerald-500" : "text-foreground"
                )}>
                  {hideBalances ? "••••" : `${t.amount > 0 ? "+" : ""}${formatEUR(t.amount)}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

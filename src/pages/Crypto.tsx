import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Bitcoin, Zap, Send, ArrowLeftRight, Coins, ShieldCheck } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cryptoHoldings, totalCryptoEUR } from "@/data/fintechMockData";
import { cn } from "@/lib/utils";

function formatEUR(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: decimals }).format(value);
}

const RISK_COLOR = {
  low:    "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  high:   "bg-rose-500/10 text-rose-500 border-rose-500/30",
};

export default function Crypto() {
  const [tab, setTab] = useState<"holdings" | "trade" | "earn">("holdings");

  const stakedEUR    = cryptoHoldings.filter((h) => h.staked).reduce((s, h) => s + h.exposureEUR, 0);
  const stakedAvgApy = cryptoHoldings.filter((h) => h.staked).reduce((s, h) => s + (h.apy ?? 0), 0) / Math.max(cryptoHoldings.filter((h) => h.staked).length, 1);
  const aggPnL       = cryptoHoldings.reduce((s, h) => s + h.exposureEUR * (h.pnlPct / 100), 0);
  const aggPnLPct    = cryptoHoldings.reduce((s, h) => s + h.pnlPct * (h.exposureEUR / totalCryptoEUR), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Investing"
        title="Crypto"
        description="Self-custodial crypto wallet integrated with the platform. Spot trading, staking, and on-chain transfers."
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5"><Send className="h-3.5 w-3.5" /> Send</Button>
            <Button size="sm" className="gap-1.5"><ArrowDown className="h-3.5 w-3.5" /> Receive</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Wallet balance" value={formatEUR(totalCryptoEUR)}    subtitle="Aggregate EUR equivalent" />
        <KpiCard title="Unrealised P&L" value={`${aggPnL >= 0 ? "+" : ""}${formatEUR(aggPnL)}`} subtitle={`${aggPnLPct >= 0 ? "+" : ""}${aggPnLPct.toFixed(2)}% blended`} />
        <KpiCard title="Staked"         value={formatEUR(stakedEUR)}         subtitle={`Avg APY ${stakedAvgApy.toFixed(2)}%`} />
        <KpiCard title="Holdings"       value={cryptoHoldings.length}        subtitle={`${cryptoHoldings.filter((h) => h.staked).length} earning yield`} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="holdings"><Coins className="h-3.5 w-3.5 mr-1.5" /> Holdings</TabsTrigger>
          <TabsTrigger value="trade"><ArrowLeftRight className="h-3.5 w-3.5 mr-1.5" /> Spot trade</TabsTrigger>
          <TabsTrigger value="earn"><Zap className="h-3.5 w-3.5 mr-1.5" /> Earn / Stake</TabsTrigger>
        </TabsList>

        {/* Holdings */}
        <TabsContent value="holdings" className="mt-4">
          <div className="bg-card border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 border-b border-border">
                  <tr className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="text-left px-4 py-2.5 font-semibold">Asset</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Holdings</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Last price</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Exposure</th>
                    <th className="text-right px-4 py-2.5 font-semibold">P&L</th>
                    <th className="text-right px-4 py-2.5 font-semibold hidden md:table-cell">Risk</th>
                    <th className="text-right px-4 py-2.5 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cryptoHoldings.map((h, i) => (
                    <motion.tr key={h.ticker} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md border border-border bg-secondary flex items-center justify-center">
                            <Bitcoin className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{h.ticker}</p>
                            <p className="text-[10px] text-muted-foreground">{h.name}{h.staked && <> · <span className="text-primary">staked</span></>}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{h.amount.toFixed(4)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatEUR(h.lastPriceEUR, h.lastPriceEUR > 100 ? 0 : 2)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatEUR(h.exposureEUR)}</td>
                      <td className={cn(
                        "px-4 py-3 text-right tabular-nums font-semibold",
                        h.pnlPct >= 0 ? "text-emerald-500" : "text-rose-500"
                      )}>
                        {h.pnlPct >= 0 ? "+" : ""}{h.pnlPct.toFixed(2)}%
                      </td>
                      <td className="px-4 py-3 text-right hidden md:table-cell">
                        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border", RISK_COLOR[h.riskScore])}>
                          {h.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-[11px]">Trade</Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Spot trade */}
        <TabsContent value="trade" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card border border-border p-5">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Trade ticket</p>
              <h2 className="text-lg font-semibold text-foreground mt-1">Buy / Sell</h2>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button variant="default" className="h-12 text-base">
                  <ArrowUp className="h-4 w-4 mr-2" /> Buy
                </Button>
                <Button variant="outline" className="h-12 text-base">
                  <ArrowDown className="h-4 w-4 mr-2" /> Sell
                </Button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Pay with</label>
                  <select className="w-full h-10 px-3 text-sm bg-background border border-border rounded-md">
                    <option>EUR · PortfolioMap Current</option>
                    <option>USD · Travel multi-currency</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Buy</label>
                  <select className="w-full h-10 px-3 text-sm bg-background border border-border rounded-md">
                    <option>BTC · Bitcoin</option>
                    <option>ETH · Ethereum</option>
                    <option>SOL · Solana</option>
                  </select>
                </div>
              </div>

              <div className="mt-5">
                <label className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Amount (EUR)</label>
                <div className="mt-1 grid grid-cols-4 gap-2">
                  {[100, 500, 1_000, 5_000].map((v) => (
                    <Button key={v} variant="outline" size="sm" className="h-10">€{v.toLocaleString("en-GB")}</Button>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-border space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Fee (0.10%)</span><span className="text-foreground tabular-nums">€1.00</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Network fee</span><span className="text-foreground tabular-nums">~€0.40</span></div>
                <div className="flex justify-between font-semibold"><span>Total cost</span><span className="text-foreground tabular-nums">€1,001.40</span></div>
              </div>

              <Button className="w-full mt-5 h-11">Place order</Button>
            </div>

            {/* Order book mock */}
            <aside className="bg-card border border-border p-5">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">BTC / EUR</p>
              <p className="text-2xl font-bold text-foreground mt-1 tabular-nums">€62,840.00</p>
              <p className="text-emerald-500 text-xs mt-0.5 font-semibold">+1.42% intraday</p>

              <div className="mt-4 space-y-1 text-[11px] tabular-nums font-mono">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Sell wall</p>
                {[63_120, 63_080, 63_010, 62_960, 62_900].map((p) => (
                  <div key={p} className="flex justify-between text-rose-400">
                    <span>{p.toLocaleString("en-GB")}</span>
                    <span className="opacity-60">{(Math.random() * 5 + 0.5).toFixed(3)}</span>
                  </div>
                ))}
                <div className="my-2 py-1 border-y border-border text-center text-foreground font-bold">62,840</div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 mt-2">Buy wall</p>
                {[62_790, 62_740, 62_690, 62_650, 62_600].map((p) => (
                  <div key={p} className="flex justify-between text-emerald-400">
                    <span>{p.toLocaleString("en-GB")}</span>
                    <span className="opacity-60">{(Math.random() * 5 + 0.5).toFixed(3)}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </TabsContent>

        {/* Earn / stake */}
        <TabsContent value="earn" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cryptoHoldings.filter((h) => h.apy).map((h) => (
              <div key={h.ticker} className="bg-card border border-border p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bitcoin className="h-5 w-5 text-primary" />
                    <p className="font-semibold text-foreground">{h.ticker}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border", RISK_COLOR[h.riskScore])}>
                    {h.riskScore}
                  </span>
                </div>
                <p className="text-3xl font-bold text-foreground mt-3 tabular-nums">{h.apy?.toFixed(2)}<span className="text-sm font-normal text-muted-foreground">% APY</span></p>
                <p className="text-xs text-muted-foreground mt-1">Auto-compounded daily · withdraw any time</p>

                <div className="mt-4 pt-4 border-t border-border text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Currently staked</span><span className="font-medium tabular-nums">{h.staked ? h.amount.toFixed(4) : "0"}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Est. yearly yield</span><span className="font-medium tabular-nums">{h.staked ? formatEUR(h.exposureEUR * (h.apy ?? 0) / 100) : "—"}</span></div>
                </div>

                <Button variant={h.staked ? "outline" : "default"} className="w-full mt-4" size="sm">
                  {h.staked ? "Unstake" : "Stake"}
                </Button>
              </div>
            ))}

            <div className="bg-card border border-dashed border-border p-5 flex flex-col items-center justify-center text-center">
              <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground mt-3">Validator-grade security</p>
              <p className="text-xs text-muted-foreground mt-1">All staking is non-custodial. Slashing protection via insurance pool.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Send, Repeat, Star, Building, FileText, ZapIcon, Plus } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { accounts, beneficiaries, recurringPayments, type Beneficiary } from "@/data/fintechMockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const beneficiaryIcon = {
  personal:        Star,
  business:        Building,
  utility:         ZapIcon,
  'tax-authority': FileText,
} as const;

function formatEUR(value: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);
}

export default function Transfers() {
  const [fromAccountId, setFromAccountId] = useState(accounts.find((a) => a.kind === "current")?.id ?? accounts[0].id);
  const [beneficiaryId, setBeneficiaryId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const selectedBeneficiary = beneficiaries.find((b) => b.id === beneficiaryId);
  const selectedAccount = accounts.find((a) => a.id === fromAccountId);

  const monthlyTransfers = recurringPayments.reduce((s, r) => s + r.amount, 0);

  const submit = () => {
    if (!selectedBeneficiary) { toast.error("Select a beneficiary"); return; }
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (selectedAccount && amt > selectedAccount.available) {
      toast.error(`Insufficient balance — available ${formatEUR(selectedAccount.available)}`);
      return;
    }
    toast.success(`Transfer initiated · ${formatEUR(amt)} to ${selectedBeneficiary.name}`);
    setAmount("");
    setReference("");
    setBeneficiaryId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ModuleHeader
        eyebrow="Banking"
        title="Transfers & FX"
        description="SEPA, SWIFT, P2P and recurring transfers across accounts and beneficiaries. Multi-currency with live FX rates."
        actions={
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> New beneficiary
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Beneficiaries"     value={beneficiaries.length}        subtitle={`${beneficiaries.filter((b) => b.recurring).length} with active standing orders`} />
        <KpiCard title="Recurring (monthly)" value={formatEUR(monthlyTransfers)} subtitle="Across active standing orders" />
        <KpiCard title="Same-day SEPA"     value="< 10 s"                       subtitle="Instant SEPA Credit Transfer" />
        <KpiCard title="FX spread"         value="0.20%"                        subtitle="Mid-market + 0.20%, no fee" />
      </div>

      <Tabs defaultValue="send">
        <TabsList>
          <TabsTrigger value="send">Send money</TabsTrigger>
          <TabsTrigger value="recurring">Standing orders</TabsTrigger>
          <TabsTrigger value="beneficiaries">Beneficiaries</TabsTrigger>
        </TabsList>

        {/* Send money */}
        <TabsContent value="send" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 bg-card border border-border p-5 space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">New transfer</p>
                <h2 className="text-lg font-semibold text-foreground mt-1">Send money</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="from">From account</Label>
                  <select
                    id="from"
                    value={fromAccountId}
                    onChange={(e) => setFromAccountId(e.target.value)}
                    className="w-full h-10 px-3 text-sm bg-background border border-border rounded-md"
                  >
                    {accounts.filter((a) => a.kind !== "brokerage" && a.kind !== "pension").map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {formatEUR(a.balanceEUR)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amount">Amount (EUR)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Beneficiary</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-auto pr-1">
                  {beneficiaries.map((b) => (
                    <BeneficiaryCard
                      key={b.id}
                      beneficiary={b}
                      selected={b.id === beneficiaryId}
                      onClick={() => setBeneficiaryId(b.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ref">Payment reference</Label>
                <Input
                  id="ref"
                  placeholder="e.g. Invoice #2026-04 / rent April"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  {selectedAccount && (
                    <>Available: <span className="font-semibold text-foreground">{formatEUR(selectedAccount.available)}</span></>
                  )}
                </div>
                <Button onClick={submit} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Send transfer
                </Button>
              </div>
            </div>

            {/* Live preview */}
            <aside className="bg-card border border-border p-5 space-y-4 h-fit">
              <p className="text-[10px] font-bold uppercase tracking-[1.4px] text-primary">Preview</p>
              <div className="space-y-3">
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">From</p>
                  <p className="text-sm font-semibold text-foreground">{selectedAccount?.name ?? "—"}</p>
                </div>
                <div className="flex justify-center text-muted-foreground">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">To</p>
                  <p className="text-sm font-semibold text-foreground">{selectedBeneficiary?.name ?? "Pick a beneficiary"}</p>
                  {selectedBeneficiary && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 break-all">{selectedBeneficiary.iban}</p>
                  )}
                </div>
                <div className="pt-3 border-t border-border">
                  <p className="text-[10.5px] uppercase tracking-wide text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-foreground">{amount ? formatEUR(parseFloat(amount) || 0) : "€0"}</p>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1 pt-2 border-t border-border">
                  <div className="flex justify-between"><span>Network</span><span className="text-foreground">SEPA Instant</span></div>
                  <div className="flex justify-between"><span>Fee</span><span className="text-foreground">€0.00</span></div>
                  <div className="flex justify-between"><span>Estimated arrival</span><span className="text-foreground">&lt; 10 seconds</span></div>
                </div>
              </div>
            </aside>
          </div>
        </TabsContent>

        {/* Standing orders */}
        <TabsContent value="recurring" className="mt-4">
          <div className="bg-card border border-border overflow-hidden">
            <header className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground flex items-center gap-2">
                <Repeat className="h-3.5 w-3.5" /> Active standing orders
              </h3>
              <Button size="sm" variant="outline" className="text-xs h-7">New standing order</Button>
            </header>
            <div className="divide-y divide-border">
              {recurringPayments.map((r, i) => {
                const b = beneficiaries.find((x) => x.id === r.beneficiaryId);
                const acc = accounts.find((a) => a.id === r.fromAccountId);
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="px-4 py-3 flex items-center gap-4 hover:bg-muted/30"
                  >
                    <div className="h-9 w-9 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
                      <Repeat className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{b?.name ?? "—"}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{r.reference} · {acc?.name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold tabular-nums">{formatEUR(r.amount)}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.cadence} · next {r.nextRunDate}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs h-8 shrink-0">Edit</Button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Beneficiaries directory */}
        <TabsContent value="beneficiaries" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {beneficiaries.map((b) => {
              const Icon = beneficiaryIcon[b.type];
              return (
                <div key={b.id} className="bg-card border border-border p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{b.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{b.bank}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-[10px] font-mono text-muted-foreground break-all">{b.iban}</p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider">
                    <span>{b.type}</span>
                    {b.recurring && <span className="text-primary font-bold">Recurring</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BeneficiaryCard({ beneficiary, selected, onClick }: { beneficiary: Beneficiary; selected: boolean; onClick: () => void }) {
  const Icon = beneficiaryIcon[beneficiary.type];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 border p-3 text-left transition-colors",
        selected ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
      )}
    >
      <div className="h-8 w-8 rounded-md border border-border bg-secondary flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{beneficiary.name}</p>
        <p className="text-[10px] text-muted-foreground truncate">{beneficiary.bank}</p>
      </div>
    </button>
  );
}

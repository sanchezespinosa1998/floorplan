import { useState } from "react";
import { Sparkles, Layers, LayoutTemplate, Workflow, ListChecks, TriangleAlert, BellRing, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { KpiCard } from "@/components/shared/KpiCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ListFilters } from "@/components/shared/ListFilters";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

const uiPrimitives = [
  "accordion",
  "alert-dialog",
  "alert",
  "aspect-ratio",
  "avatar",
  "badge",
  "breadcrumb",
  "button",
  "calendar",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "form",
  "hover-card",
  "input",
  "input-otp",
  "label",
  "menubar",
  "navigation-menu",
  "pagination",
  "popover",
  "progress",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "tooltip",
];

const productBlocks = [
  { name: "Topbar",         summary: "Search capsule, result dropdown, user block and sign-out action" },
  { name: "TopNavigation",  summary: "Desktop tabs + mobile menu with permission-aware items" },
  { name: "StatusBadge",    summary: "Unified statuses for position, order, portfolio and rebalance" },
  { name: "ListFilters",    summary: "Global filters with search, selects and date ranges" },
  { name: "TableSearchBar", summary: "Fast table-level search with clear action and result count" },
  { name: "KpiCard",        summary: "KPI cards used on the dashboard and portfolio summary blocks" },
  { name: "Breadcrumbs",    summary: "Hierarchical navigation path across pages" },
  { name: "3D portfolio map", summary: "Three.js editor toolbars, position panels and context controls" },
];

export default function UICatalog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [filtersSearch, setFiltersSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  return (
    <div className="space-y-6 animate-fade-in">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/" }, { label: "UI Catalog" }]} />

      <div className="border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Complete Inventory
            </p>
            <h1 className="mt-3 text-2xl font-bold text-foreground">Prototype UI Catalog</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              One page with a complete summary of all visual elements: primitives, product blocks, patterns and active usage.
            </p>
          </div>
          <Button onClick={() => toast.success("Toast demo from UI Catalog")}>Test Toast</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <KpiCard title="UI primitives" value={uiPrimitives.length} subtitle="in components/ui" icon={Layers} />
        <KpiCard title="Product blocks" value={productBlocks.length} subtitle="shared + layout" icon={LayoutTemplate} />
        <KpiCard title="Core patterns" value={11} subtitle="tables, forms, overlays, nav" icon={Workflow} />
        <KpiCard title="States" value={4} subtitle="stand, booking, fair, version" icon={ListChecks} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Color and status language</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <div className="border border-border p-3 text-xs"><div className="mb-2 h-8 bg-primary" />Primary</div>
            <div className="border border-border p-3 text-xs"><div className="mb-2 h-8 bg-accent" />Accent</div>
            <div className="border border-border p-3 text-xs"><div className="mb-2 h-8 bg-warning" />Warning</div>
            <div className="border border-border p-3 text-xs"><div className="mb-2 h-8 bg-success" />Success</div>
            <div className="border border-border p-3 text-xs"><div className="mb-2 h-8 bg-destructive" />Destructive</div>
            <div className="border border-border p-3 text-xs"><div className="mb-2 h-8 bg-neutral" />Neutral</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge type="stand" status="available" />
            <StatusBadge type="stand" status="pending" />
            <StatusBadge type="stand" status="reserved" />
            <StatusBadge type="booking" status="available" />
            <StatusBadge type="fair" status="comercialización" />
            <StatusBadge type="version" status="published" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="actions">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="overlay">Overlay</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buttons and badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link button</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="icon" aria-label="Icon button">
                  <BellRing className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inputs, selects and controls</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="catalog-name">Name</Label>
                <Input id="catalog-name" placeholder="Write something" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="architect">
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="architect">Architect</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="organizer">Organizer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="catalog-notes">Notes</Label>
                <Textarea id="catalog-notes" placeholder="Long-form field demo" />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="catalog-checkbox" defaultChecked />
                <Label htmlFor="catalog-checkbox">Checkbox option</Label>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="catalog-switch">Enable notifications</Label>
                <Switch id="catalog-switch" defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reusable product filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ListFilters
                searchValue={filtersSearch}
                onSearchChange={setFiltersSearch}
                searchPlaceholder="Search portfolios, mandates, users"
                searchAriaLabel="Catalog filter demo"
                dateFrom={fromDate}
                dateTo={toDate}
                onDateFromChange={setFromDate}
                onDateToChange={setToDate}
                selects={[
                  {
                    label: "Status",
                    value: statusFilter,
                    onChange: setStatusFilter,
                    options: [
                      { value: "all", label: "All" },
                      { value: "available", label: "Available" },
                      { value: "pending", label: "Pending" },
                      { value: "reserved", label: "Reserved" },
                    ],
                  },
                ]}
                onReset={() => {
                  setFiltersSearch("");
                  setStatusFilter("all");
                  setFromDate("");
                  setToDate("");
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Table patterns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={3} />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ana Ruiz</TableCell>
                      <TableCell>PortfolioMap Capital</TableCell>
                      <TableCell>ana.lopez@portfoliomap.io</TableCell>
                      <TableCell><StatusBadge type="booking" status="reserved" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Carlos Pérez</TableCell>
                      <TableCell>Sanchez Family Office</TableCell>
                      <TableCell>laura.sanchez@cliente.com</TableCell>
                      <TableCell><StatusBadge type="booking" status="pending" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Lucía Mora</TableCell>
                      <TableCell>KPMG Audit</TableCell>
                      <TableCell>jorge.fernandez@portfoliomap.io</TableCell>
                      <TableCell><StatusBadge type="booking" status="available" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overlay" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dialog, alert dialog, tooltip and popover</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(true)}>Open Dialog</Button>
              <Button variant="destructive" onClick={() => setAlertOpen(true)}>Open Alert Dialog</Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="secondary">Open Popover</Button>
                </PopoverTrigger>
                <PopoverContent>
                  <p className="text-sm text-foreground">Popover content for contextual actions and quick notes.</p>
                </PopoverContent>
              </Popover>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Search className="h-4 w-4" />
                    Hover me
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tooltip content sample</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All UI primitives in the prototype</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-6">
                {uiPrimitives.map((item) => (
                  <div key={item} className="border border-border bg-background px-2.5 py-2 text-xs">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product-specific UI blocks summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {productBlocks.map((block) => (
                <div key={block.name} className="border border-border bg-background p-3">
                  <p className="font-medium text-foreground">{block.name}</p>
                  <p className="text-sm text-muted-foreground">{block.summary}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-warning/40 bg-warning/5">
            <CardContent className="pt-6">
              <p className="flex items-start gap-2 text-sm text-warning">
                <TriangleAlert className="mt-0.5 h-4 w-4" />
                This catalog centralizes and summarizes every UI family used in the prototype and lists the full primitives registry from components/ui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Demo</DialogTitle>
            <DialogDescription>
              Reusable modal used for forms, editing and confirmations across the app.
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">This is a sample dialog body from the new catalog.</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
            <Button onClick={() => setDialogOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Alert dialogs are used for dangerous or irreversible actions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.success("Action confirmed")}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

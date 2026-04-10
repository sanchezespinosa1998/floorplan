import { useState, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { 
  History, Plus, Trash2, Globe, Save,
  Clock, User, FileText, ArrowRight, AlertTriangle, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { 
  fairVersionStatusLabels,
  fairs, getFairVersions, getCurrentFairVersion,
  deleteVersion, createVersion, 
  publishVersion, saveDraftVersion, currentUser 
} from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { usePagination } from "@/hooks/usePagination";
import { useTableSort } from "@/hooks/useTableSort";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { SortButton } from "@/components/shared/SortableHeader";
import { ColumnFilterButton } from "@/components/shared/ColumnFilterButton";
import { TableSearchBar } from "@/components/shared/TableSearchBar";

type FairVersion = ReturnType<typeof getFairVersions>[0];

function VersionCard({
  version,
  isPublished,
  canManageVersions,
  onPublish,
  onSaveDraft,
  onDelete,
  formatDate,
}: {
  version: FairVersion;
  isPublished: boolean;
  canManageVersions: boolean;
  onPublish: (id: string) => void;
  onSaveDraft: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-card border border-border overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <History className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium text-foreground">{version.label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={version.status} type="version" />
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-3">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0 }}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="text-sm text-foreground">{formatDate(version.createdAt)}</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Author:</span>
                <span className="text-sm text-foreground">{version.createdBy}</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-2"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm text-muted-foreground">Summary:</span>
                  <p className="text-sm text-foreground mt-1">{version.summary}</p>
                </div>
              </motion.div>

              {canManageVersions && !isPublished && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-wrap gap-2 pt-2 border-t border-border"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSaveDraft(version.id)}
                    className="gap-1 min-h-[44px] text-primary border-primary/40 hover:bg-primary/10"
                  >
                    <Save className="h-4 w-4" /> Save Draft
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPublish(version.id)}
                    className="gap-1 min-h-[44px] text-emerald-600 border-emerald-500/40 hover:bg-emerald-500/10"
                  >
                    <Globe className="h-4 w-4" /> Publish
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(version.id)}
                    className="gap-1 min-h-[44px] text-destructive border-destructive/40 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </motion.div>
              )}
              {canManageVersions && isPublished && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="pt-2 border-t border-border"
                >
                  <span className="text-xs text-muted-foreground">Published version - read only</span>
                </motion.div>
              )}
              {!canManageVersions && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="pt-2 border-t border-border"
                >
                  <span className="text-xs text-muted-foreground">View only</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FairVersions() {
  const { fairId } = useParams();
  const [searchParams] = useSearchParams();
  const { can } = useProfile();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState("");
  const [newVersionSummary, setNewVersionSummary] = useState("");
  const [tableSearch, setTableSearch] = useState("");

  const fair = fairs.find(f => f.id === fairId);
  
  const versions = useMemo(() => {
    if (!fairId) return [];
    return getFairVersions(fairId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [fairId, fair?.versions.length]);

  const currentVersion = useMemo(() => {
    if (!fairId) return null;
    return getCurrentFairVersion(fairId);
  }, [fairId, fair?.versions.length]);

  if (!fair) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">
          Fair not found
        </div>
        <Link to="/fairs" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to fairs
        </Link>
      </div>
    );
  }

  const handleDeleteVersion = (versionId: string) => {
    const result = deleteVersion(fairId!, versionId);
    if (result) {
      toast.success("Version deleted successfully");
    } else {
      toast.error("Could not delete version. Only draft versions can be deleted.");
    }
  };

  const handlePublishVersion = (versionId: string) => {
    const result = publishVersion(fairId!, versionId);
    if (result) {
      toast.success("Version published successfully. Previous published version is now a draft.");
    } else {
      toast.error("Could not publish version");
    }
  };

  const handleSaveDraft = (versionId: string) => {
    const result = saveDraftVersion(fairId!, versionId);
    if (result) {
      toast.success("Draft saved successfully");
    } else {
      toast.error("Could not save draft");
    }
  };

  const handleCreateVersion = () => {
    if (!newVersionLabel.trim() || !newVersionSummary.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const result = createVersion(
      fairId!, 
      newVersionLabel, 
      newVersionSummary, 
      currentUser.name,
      currentVersion?.id
    );

    if (result) {
      toast.success("Version created successfully");
      setIsCreateDialogOpen(false);
      setNewVersionLabel("");
      setNewVersionSummary("");
    } else {
      toast.error("Could not create version");
    }
  };

  const canManageVersions = can("manage_versions");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextVersionNumber = () => {
    const publishedCount = versions.filter(v => v.status === 'publicada').length;
    const draftCount = versions.filter(v => v.status === 'borrador').length;
    return `v${publishedCount + 1}.${draftCount}`;
  };

  const filteredVersions = useMemo(() => {
    const globalQuery = (searchParams.get("q") || "").trim().toLowerCase();
    const normalizedVersion = (searchParams.get("vfLabel") || "").trim().toLowerCase();
    const normalizedSummary = (searchParams.get("vfSummary") || "").trim().toLowerCase();
    const normalizedAuthor = (searchParams.get("vfAuthor") || "").trim().toLowerCase();
    const statusFilter = (searchParams.get("vfStatus") || "all") as 'all' | FairVersion['status'];
    const dateFrom = searchParams.get("vfFrom") || "";
    const dateTo = searchParams.get("vfTo") || "";

    return versions.filter(version => {
      const searchable = [version.label, version.summary, version.createdBy, version.status].join(" ").toLowerCase();

      const matchesGlobal = !globalQuery || searchable.includes(globalQuery);
      const matchesVersion = !normalizedVersion || version.label.toLowerCase().includes(normalizedVersion);
      const matchesSummary = !normalizedSummary || version.summary.toLowerCase().includes(normalizedSummary);
      const matchesAuthor = !normalizedAuthor || version.createdBy.toLowerCase().includes(normalizedAuthor);
      const matchesStatus = statusFilter === 'all' || version.status === statusFilter;
      const versionTime = new Date(version.createdAt).getTime();
      const matchesFrom = !dateFrom || versionTime >= new Date(dateFrom).getTime();
      const matchesTo = !dateTo || versionTime <= new Date(dateTo).getTime();
      return matchesGlobal && matchesVersion && matchesSummary && matchesAuthor && matchesStatus && matchesFrom && matchesTo;
    });
  }, [versions, searchParams]);

  const { filters, setFilter, clearFilter, applyFilters } = useColumnFilters<(typeof filteredVersions)[number]>();
  const vStatusOptions = useMemo(() => [...new Set(filteredVersions.map(v => v.status))].sort(), [filteredVersions]);
  const tableSearchFiltered = !tableSearch.trim()
    ? filteredVersions
    : filteredVersions.filter(v => [v.label, v.status, v.createdBy, v.summary].join(' ').toLowerCase().includes(tableSearch.trim().toLowerCase()));
  const columnFiltered = applyFilters(tableSearchFiltered, {
    label:     v => v.label,
    status:    v => v.status,
    createdBy: v => v.createdBy,
    summary:   v => v.summary,
  });

  const { sortedItems: sortedVersions, sortKey, sortDir, handleSort } = useTableSort(columnFiltered, (item, key) => {
    switch (key) {
      case 'label':     return item.label;
      case 'status':    return item.status;
      case 'createdAt': return new Date(item.createdAt).getTime();
      case 'createdBy': return item.createdBy;
      case 'summary':   return item.summary;
      default:          return null;
    }
  });

  const { paginatedItems: paginatedVersions, PaginationComponent } = usePagination({ items: sortedVersions, itemsPerPage: 10 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">Versions of {fair.name} {fair.edition}</h2>
          <p className="text-sm text-muted-foreground">
            Manage the floor plan versions of the fair
          </p>
        </div>

        {canManageVersions && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New version
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create new version</DialogTitle>
                <DialogDescription>
                  Create a new version based on the current version ({currentVersion?.label || 'N/A'})
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version number</label>
                  <Input
                    value={newVersionLabel}
                    onChange={(e) => setNewVersionLabel(e.target.value)}
                    placeholder={getNextVersionNumber()}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Change summary</label>
                  <Textarea
                    value={newVersionSummary}
                    onChange={(e) => setNewVersionSummary(e.target.value)}
                    placeholder="Describe the changes made in this version..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateVersion}>
                  Create version
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{versions.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {versions.filter(v => v.status === 'publicada').length}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {versions.filter(v => v.status === 'borrador').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Versions Table - Desktop */}
      <Card className="hidden md:block">
        <TableSearchBar value={tableSearch} onChange={setTableSearch} resultCount={sortedVersions.length} />
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[180px]"><SortButton label="Version"  sortKey="label"     currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort} filterPopover={<ColumnFilterButton columnKey="label"     mode="text" currentFilter={filters["label"]}     onFilter={setFilter} onClear={clearFilter} />} /></TableHead>
                <TableHead><SortButton label="Status"   sortKey="status"    currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort} filterPopover={<ColumnFilterButton columnKey="status"    mode="enum" enumOptions={vStatusOptions} optionLabels={fairVersionStatusLabels as Record<string,string>} currentFilter={filters["status"]}    onFilter={setFilter} onClear={clearFilter} />} /></TableHead>
                <TableHead><SortButton label="Date"     sortKey="createdAt" currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort} /></TableHead>
                <TableHead><SortButton label="Author"   sortKey="createdBy" currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort} filterPopover={<ColumnFilterButton columnKey="createdBy" mode="text" currentFilter={filters["createdBy"]} onFilter={setFilter} onClear={clearFilter} />} /></TableHead>
                <TableHead><SortButton label="Summary"  sortKey="summary"   currentSortKey={sortKey} currentSortDir={sortDir} onSort={handleSort} filterPopover={<ColumnFilterButton columnKey="summary"   mode="text" currentFilter={filters["summary"]}   onFilter={setFilter} onClear={clearFilter} />} /></TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVersions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No versions found with selected filters
                  </TableCell>
                </TableRow>
              ) : (
                paginatedVersions.map((version, index) => {
                  const isPublished = version.status === 'publicada';
                  return (
                    <motion.tr
                      key={version.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.03 }}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{version.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={version.status} type="version" />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          {version.createdBy}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-start gap-1 text-sm">
                          <FileText className="h-3 w-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                          <span className="line-clamp-2">{version.summary}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {canManageVersions && !isPublished && (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSaveDraft(version.id)}
                              title="Save draft"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublishVersion(version.id)}
                              title="Publish version"
                              className="text-emerald-600 hover:text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <Globe className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Delete versión"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete versión</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que deseas eliminar la versión {version.label}? 
                                    Esta acción no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteVersion(version.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                        {canManageVersions && isPublished && (
                          <span className="text-xs text-muted-foreground">Read only</span>
                        )}
                        {!canManageVersions && (
                          <span className="text-xs text-muted-foreground">View only</span>
                        )}
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Versions Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredVersions.length === 0 ? (
          <div className="bg-card border border-border p-8 text-center text-muted-foreground text-sm">
            No versions found with selected filters
          </div>
        ) : (
          paginatedVersions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <VersionCard
                version={version}
                isPublished={version.status === 'publicada'}
                canManageVersions={canManageVersions}
                onPublish={handlePublishVersion}
                onSaveDraft={handleSaveDraft}
                onDelete={handleDeleteVersion}
                formatDate={formatDate}
              />
            </motion.div>
          ))
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Version information</h3>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                <li>• <strong>New version:</strong> Creates a new draft based on the current version</li>
                <li>• <strong>Save Draft:</strong> Saves changes to the current draft</li>
                <li>• <strong>Publish:</strong> Publishes the version - the previous published version becomes a draft</li>
                <li>• <strong>Delete:</strong> Only draft versions can be deleted</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <PaginationComponent />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  History,
  Globe,
  Clock,
  User,
  FileText,
  ArrowRight,
  PenLine,
  Lock,
  Pencil,
  GitBranch,
  Layers,
  Info,
  Search,
  RefreshCw,
  GitCompare,
  Copy,
  Map,
  Pin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  fairs,
  getFairVersions,
  getFairDraft,
  getPublishedVersions,
  publishArchitectVersion,
  createArchitectDraftFromVersion,
  subscribeToFairRealtime,
} from "@/data/mockData";
import { useProfile } from "@/context/ProfileContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FairVersion = ReturnType<typeof getFairVersions>[number];
type VersionStatusFilter = "all" | "draft" | "published" | "commercial_draft";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getVersionDelta(target: FairVersion, base: FairVersion | null) {
  if (!base) return { stands: 0, occupancy: 0, pending: 0 };
  return {
    stands: target.standsSnapshot - base.standsSnapshot,
    occupancy: target.occupancySnapshot - base.occupancySnapshot,
    pending: target.pendingSnapshot - base.pendingSnapshot,
  };
}

function DeltaBadge({ value, suffix = "" }: { value: number; suffix?: string }) {
  const color = value > 0 ? "text-emerald-600" : value < 0 ? "text-destructive" : "text-muted-foreground";
  const prefix = value > 0 ? "+" : "";
  return <span className={color}>{`${prefix}${value}${suffix}`}</span>;
}

export default function FairVersions() {
  const { fairId } = useParams();
  const navigate = useNavigate();
  const { can, activeUser } = useProfile();
  const canManageVersions = can("manage_versions");

  const [refreshTick, setRefreshTick] = useState(0);
  const [query, setQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<VersionStatusFilter>("all");
  const [compareLeftId, setCompareLeftId] = useState<string | null>(null);
  const [compareRightId, setCompareRightId] = useState<string | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishConflict, setPublishConflict] = useState<string | null>(null);
  const [candidateVersionId, setCandidateVersionId] = useState<string | null>(null);

  useEffect(() => {
    if (!fairId) return;
    return subscribeToFairRealtime(fairId, () => {
      setRefreshTick((prev) => prev + 1);
    });
  }, [fairId]);

  const fair = fairs.find((f) => f.id === fairId);

  const allVersions = useMemo(() => {
    if (!fairId) return [] as FairVersion[];
    return [...getFairVersions(fairId)].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [fairId, refreshTick, fair?.versions.length]);

  const draft = useMemo(() => {
    if (!fairId) return null;
    return getFairDraft(fairId);
  }, [fairId, refreshTick, fair?.versions.length]);

  const publishedVersions = useMemo(() => {
    if (!fairId) return [] as FairVersion[];
    return getPublishedVersions(fairId);
  }, [fairId, refreshTick, fair?.versions.length]);

  const activePublished = publishedVersions[0] || null;

  const baseVersion = useMemo(() => {
    if (!draft?.basedOnVersionId) return activePublished;
    return publishedVersions.find((v) => v.id === draft.basedOnVersionId) || activePublished;
  }, [draft, publishedVersions, activePublished]);

  const authors = useMemo(() => {
    const items = Array.from(new Set(allVersions.map((v) => v.createdBy))).sort((a, b) =>
      a.localeCompare(b, "en")
    );
    return items;
  }, [allVersions]);

  const filteredVersions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return allVersions.filter((version) => {
      const matchesQuery =
        !normalized ||
        [version.label, version.summary, version.createdBy].join(" ").toLowerCase().includes(normalized);
      const matchesAuthor = authorFilter === "all" || version.createdBy === authorFilter;
      const matchesStatus = statusFilter === "all" || version.status === statusFilter;
      return matchesQuery && matchesAuthor && matchesStatus;
    });
  }, [allVersions, query, authorFilter, statusFilter]);

  const compareLeft = useMemo(
    () => (compareLeftId ? allVersions.find((v) => v.id === compareLeftId) || null : null),
    [compareLeftId, allVersions]
  );
  const compareRight = useMemo(
    () => (compareRightId ? allVersions.find((v) => v.id === compareRightId) || null : null),
    [compareRightId, allVersions]
  );

  const candidateVersion = useMemo(
    () => (candidateVersionId ? allVersions.find((v) => v.id === candidateVersionId) || null : null),
    [candidateVersionId, allVersions]
  );

  if (!fair) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12 text-muted-foreground">Fair not found</div>
        <Link to="/fairs" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowRight className="h-4 w-4 rotate-180" /> Back to fairs
        </Link>
      </div>
    );
  }

  const publishDelta = draft ? getVersionDelta(draft, baseVersion) : null;

  const handlePublish = () => {
    if (!draft || !fairId) return;
    const result = publishArchitectVersion(fairId, activeUser.name, draft.rowVersion);
    if (result.ok && result.version) {
      setPublishConflict(null);
      setIsPublishDialogOpen(false);
      toast.success(`Version ${result.version.label} published successfully.`);
      setRefreshTick((prev) => prev + 1);
    } else if (result.conflict) {
      setPublishConflict("Draft changed before publish. Refresh and compare before trying again.");
      toast.error("Publish conflict detected.");
      setRefreshTick((prev) => prev + 1);
    } else {
      toast.error(result.reason || "Could not publish the version.");
    }
  };

  const handleEditChanges = () => {
    navigate(`/fairs/${fairId}/plan`);
  };

  const handleCreateDraftFromVersion = (versionId: string) => {
    if (!fairId) return;
    const result = createArchitectDraftFromVersion(fairId, versionId, activeUser.name);
    if (result.ok && result.version) {
      toast.success(`Draft updated from ${result.version.basedOnVersionId || "selected version"}.`);
      setRefreshTick((prev) => prev + 1);
      return;
    }
    toast.error(result.reason || "Could not update draft.");
  };

  const handleCompareWithActive = (versionId: string) => {
    const right = activePublished?.id || draft?.id;
    if (!right) {
      toast.error("No active reference version available to compare.");
      return;
    }
    setCompareLeftId(versionId);
    setCompareRightId(right);
    setIsCompareOpen(true);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-2"
      >
        <h2 className="text-lg font-semibold text-foreground">Versions of {fair.name} {fair.edition}</h2>
        <p className="text-sm text-muted-foreground">Version history and release workflow for this fair plan</p>
      </motion.div>

      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border border-border rounded-lg p-3">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Active published</p>
            <p className="font-medium text-foreground">{activePublished?.label || "None"}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Draft base</p>
            <p className="font-medium text-foreground">{baseVersion?.label || "None"}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Draft status</p>
            <p className="font-medium text-foreground">{draft ? `Updated ${formatDate(draft.updatedAt || draft.createdAt)}` : "No active draft"}</p>
          </div>
          <div className="text-sm">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Candidate</p>
            <p className="font-medium text-foreground">{candidateVersion?.label || "Not selected"}</p>
          </div>
          <div className="text-sm flex items-end justify-start md:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRefreshTick((prev) => prev + 1)} className="gap-1.5">
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" onClick={handleEditChanges} className="gap-1.5">
              <Map className="h-4 w-4" /> Open 3D viewer
            </Button>
          </div>
        </div>
      </div>

      {publishConflict && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 flex items-start justify-between gap-3">
            <p className="text-sm text-destructive">{publishConflict}</p>
            <Button variant="outline" size="sm" onClick={() => setRefreshTick((prev) => prev + 1)}>Reload</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Published versions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-600" />
              <div className="text-2xl font-bold text-emerald-600">{publishedVersions.length}</div>
            </div>
            {activePublished && <p className="text-xs text-muted-foreground mt-1">Latest: {activePublished.label}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Draft workspace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <PenLine className="h-5 w-5 text-amber-500" />
              <div className="text-2xl font-bold text-amber-500">{draft ? 1 : 0}</div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Editable technical copy</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Workflow</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-muted-foreground">Published version (read-only)</span>
          </div>
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0 text-muted-foreground/50" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</div>
            <span className="text-amber-500 font-medium">Draft (editable copy)</span>
          </div>
          <ArrowRight className="h-4 w-4 rotate-90 sm:rotate-0 text-muted-foreground/50" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">3</div>
            <span className="text-primary font-medium">Publish -&gt; New official version</span>
          </div>
        </div>
      </div>

      {draft ? (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-base">Your workspace</CardTitle>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">Editable copy</span>
              </div>
              {canManageVersions && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleEditChanges} className="gap-1.5 text-primary border-primary/40 hover:bg-primary/10">
                    <Pencil className="h-4 w-4" /> Edit changes
                  </Button>
                  <Button size="sm" onClick={() => setIsPublishDialogOpen(true)} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Globe className="h-4 w-4" /> Publish as new version
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-500/90">
                  This draft is based on <strong className="text-foreground">{baseVersion?.label || "published"}</strong>. Changes here are isolated until publish.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Last updated: {formatDate(draft.updatedAt || draft.createdAt)}</span>
              <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Author: {draft.createdBy}</span>
              <span className="flex items-center gap-1.5"><GitBranch className="h-3.5 w-3.5" /> Row version: {draft.rowVersion || 1}</span>
            </div>
            <p className="text-sm text-foreground">{draft.summary}</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-muted-foreground/30">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            There is no active technical draft. Use any published version row action to create one.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Version timeline</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Search, filter and act on versions</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full md:w-auto">
              <div className="relative sm:min-w-[220px]">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} className="pl-8" placeholder="Search by label, author or summary" />
              </div>
              <select
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="h-9 border border-border bg-background px-2 text-sm"
              >
                <option value="all">All authors</option>
                {authors.map((author) => (
                  <option key={author} value={author}>{author}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as VersionStatusFilter)}
                className="h-9 border border-border bg-background px-2 text-sm"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="commercial_draft">Commercial draft</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-[140px]">Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Summary</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVersions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No versions match the selected filters</TableCell>
                </TableRow>
              ) : (
                filteredVersions.map((version, index) => {
                  const reference = version.status === "published" ? activePublished : baseVersion;
                  const delta = getVersionDelta(version, reference || null);
                  return (
                    <motion.tr
                      key={version.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.02 }}
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
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="space-y-0.5">
                          <p>Stands: <DeltaBadge value={delta.stands} /></p>
                          <p>Occupancy: <DeltaBadge value={delta.occupancy} suffix="%" /></p>
                          <p>Pending: <DeltaBadge value={delta.pending} /></p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleEditChanges} title="Open in 3D viewer">
                            <Map className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => handleCompareWithActive(version.id)} title="Compare with active">
                            <GitCompare className="h-3.5 w-3.5" />
                          </Button>
                          {version.status === "published" && (
                            <Button
                              variant={candidateVersionId === version.id ? "default" : "outline"}
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => setCandidateVersionId((prev) => (prev === version.id ? null : version.id))}
                              title="Mark as candidate"
                            >
                              <Pin className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canManageVersions && version.status === "published" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => handleCreateDraftFromVersion(version.id)}
                              title="Create draft from this version"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm publish</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new official version from your current draft and make it the active published version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {draft && (
            <div className="text-sm border border-border rounded-md p-3 space-y-1">
              <p><strong>Draft:</strong> {draft.label}</p>
              <p><strong>Based on:</strong> {baseVersion?.label || "Unknown"}</p>
              <p><strong>Impact:</strong> stands <DeltaBadge value={publishDelta?.stands || 0} />, occupancy <DeltaBadge value={publishDelta?.occupancy || 0} suffix="%" />, pending <DeltaBadge value={publishDelta?.pending || 0} /></p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publish now</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compare versions</DialogTitle>
            <DialogDescription>Difference summary between selected versions</DialogDescription>
          </DialogHeader>
          {compareLeft && compareRight ? (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Left</p>
                  <p className="font-medium">{compareLeft.label}</p>
                  <p className="text-muted-foreground">{compareLeft.createdBy} · {formatDate(compareLeft.createdAt)}</p>
                </div>
                <div className="border border-border rounded-md p-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Right</p>
                  <p className="font-medium">{compareRight.label}</p>
                  <p className="text-muted-foreground">{compareRight.createdBy} · {formatDate(compareRight.createdAt)}</p>
                </div>
              </div>
              {(() => {
                const delta = getVersionDelta(compareLeft, compareRight);
                return (
                  <div className="border border-border rounded-md p-3 space-y-1">
                    <p>Stands: <DeltaBadge value={delta.stands} /></p>
                    <p>Occupancy: <DeltaBadge value={delta.occupancy} suffix="%" /></p>
                    <p>Pending reservations: <DeltaBadge value={delta.pending} /></p>
                  </div>
                );
              })()}
              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="border border-border rounded-md p-3">
                  <p className="font-medium text-foreground mb-1">Summary (left)</p>
                  <p>{compareLeft.summary}</p>
                </div>
                <div className="border border-border rounded-md p-3">
                  <p className="font-medium text-foreground mb-1">Summary (right)</p>
                  <p>{compareRight.summary}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select two valid versions to compare.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Building2, User as UserIcon, Upload, Save, X, Check } from "lucide-react";
import { fairs, venues, users, addFair, updateFair, type Fair, type FairStatus, type User } from "@/data/mockData";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface FairFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  fair?: Fair | null;
}

const steps = [
  "Fair data",
  "Revit file",
  "Team members",
];

const fairStatusOptions: { value: FairStatus; label: string }[] = [
  { value: "planificación", label: "Planning" },
  { value: "comercialización", label: "Sales" },
  { value: "en_curso", label: "En curso" },
  { value: "finalizada", label: "Finalizada" },
];

export function FairFormWizard({ open, onOpenChange, onSuccess, fair }: FairFormWizardProps) {
  const isEditing = Boolean(fair);
  const isMobile = useIsMobile();
  const progressTimerRef = useRef<number | null>(null);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [edition, setEdition] = useState("");
  const [venueId, setVenueId] = useState("");
  const [status, setStatus] = useState<FairStatus>("planificación");
  const [responsible, setResponsible] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [revitFileName, setRevitFileName] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const [errors, setErrors] = useState<{
    name?: string;
    edition?: string;
    venueId?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const selectedVenue = venues.find(v => v.id === venueId);

  useEffect(() => {
    if (open) {
      if (fair) {
        setName(fair.name);
        setEdition(fair.edition);
        setVenueId(fair.venueId);
        setStatus(fair.status);
        setResponsible(fair.responsible);
        setStartDate(fair.startDate);
        setEndDate(fair.endDate);
        setSelectedUsers([]);
      } else {
        setStep(0);
        setName("");
        setEdition("");
        setVenueId("");
        setStatus("planificación");
        setResponsible("");
        setStartDate("");
        setEndDate("");
        setRevitFileName("");
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setSelectedUsers([]);
      }
      setErrors({});
    }
  }, [open, fair]);

  useEffect(() => {
    return () => {
      if (progressTimerRef.current !== null) {
        window.clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  const validateStep = () => {
    const newErrors: typeof errors = {};

    if (step === 0) {
      if (!name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!edition.trim()) {
        newErrors.edition = "Edition is required";
      }
      if (!venueId) {
        newErrors.venueId = "Please select a venue";
      }
      if (!startDate) {
        newErrors.startDate = "Start date is required";
      }
      if (!endDate) {
        newErrors.endDate = "End date is required";
      }
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canGoNext = () => {
    if (step === 0) {
      return Boolean(name.trim() && edition.trim() && venueId && startDate && endDate);
    }
    if (step === 1) {
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  const handleRevitFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setRevitFileName(file.name);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    if (progressTimerRef.current !== null) {
      window.clearInterval(progressTimerRef.current);
    }

    progressTimerRef.current = window.setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          if (progressTimerRef.current !== null) {
            window.clearInterval(progressTimerRef.current);
            progressTimerRef.current = null;
          }
          setIsAnalyzing(false);
          return 100;
        }
        return Math.min(prev + 20, 100);
      });
    }, 140);
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      if (isEditing && fair) {
        updateFair(fair.id, {
          name,
          edition,
          venueId,
          venueName: selectedVenue?.name || "",
          status,
          responsible: responsible || "Unassigned",
          startDate,
          endDate,
        });
        toast.success(`Fair "${name} ${edition}" updated successfully`);
      } else {
        addFair({
          name,
          edition,
          venueId,
          venueName: selectedVenue?.name || "",
          status,
          occupancy: 0,
          totalStands: 50,
          freeStands: 50,
          reservedStands: 0,
          pendingReservations: 0,
          responsible: responsible || "Unassigned",
          startDate,
          endDate,
        });
        toast.success(`Fair "${name} ${edition}" created successfully`);
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? "Error updating fair" : "Error creating fair");
    } finally {
      setLoading(false);
    }
  };

  const stepContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {steps.length}</span>
          <span>{steps[step]}</span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fairName">
                Name *
              </Label>
              <Input
                id="fairName"
                type="text"
                placeholder="e.g., Fitur"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition">
                Edition *
              </Label>
              <Input
                id="edition"
                type="text"
                placeholder="e.g., 2027"
                value={edition}
                onChange={(e) => {
                  setEdition(e.target.value);
                  if (errors.edition) setErrors({ ...errors, edition: undefined });
                }}
                aria-invalid={!!errors.edition}
              />
              {errors.edition && (
                <p className="text-xs text-destructive">{errors.edition}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue">
              Venue *
            </Label>
            <Select value={venueId} onValueChange={(v) => {
              setVenueId(v);
              if (errors.venueId) setErrors({ ...errors, venueId: undefined });
            }}>
              <SelectTrigger aria-invalid={!!errors.venueId}>
                <SelectValue placeholder="Select venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SelectItem key={venue.id} value={venue.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {venue.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.venueId && (
              <p className="text-xs text-destructive">{errors.venueId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors({ ...errors, startDate: undefined });
                  if (errors.endDate) setErrors({ ...errors, endDate: undefined });
                }}
                aria-invalid={!!errors.startDate}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) setErrors({ ...errors, endDate: undefined });
                }}
                aria-invalid={!!errors.endDate}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FairStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {fairStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">
              Manager
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="responsible"
                type="text"
                placeholder="Manager name"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="p-3 rounded-md border border-border bg-muted/40">
            <p className="text-xs text-muted-foreground">
              Upload a Revit file (.rvt) to associate with this fair. The file will be analyzed for model information.
            </p>
          </div>

          <div>
            <Label>Revit file (.rvt)</Label>
            <div className="mt-2">
              <label
                htmlFor="revit-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {revitFileName ? revitFileName : "Click to upload or drag and drop"}
                  </p>
                  {revitFileName && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" /> File selected
                    </p>
                  )}
                </div>
                <input
                  id="revit-file"
                  type="file"
                  accept=".rvt"
                  className="hidden"
                  onChange={handleRevitFileChange}
                />
              </label>
            </div>
          </div>

          {(isAnalyzing || analysisProgress > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Analyzing model</span>
                <span>{analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="h-2" />
            </div>
          )}

          {!isAnalyzing && analysisProgress === 100 && revitFileName && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Analysis complete
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <Label>Select team members for this fair</Label>
            <p className="text-xs text-muted-foreground mt-1">
              Choose users who will have access to manage this fair
            </p>
          </div>

          <div className="border border-border rounded-lg max-h-72 overflow-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => handleUserToggle(user.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="text-xs text-muted-foreground capitalize">
                  {user.role.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );

  const actions = (
    <div className="flex items-center justify-between gap-2 pt-2">
      <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
        Back
      </Button>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        {step < steps.length - 1 ? (
          <Button type="button" onClick={handleNext} disabled={!canGoNext()}>
            Next
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? (isEditing ? "Saving..." : "Creating...") : (isEditing ? "Save changes" : "Create fair")}
          </Button>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[92vh]">
          <DrawerHeader>
            <DrawerTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-primary" />
              </div>
              {isEditing ? "Edit fair" : "New fair"}
            </DrawerTitle>
            <DrawerDescription>
              {isEditing ? "Edit fair details" : "Create a new fair with wizard steps"}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-auto space-y-4">{stepContent}</div>
          <DrawerFooter>{actions}</DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            {isEditing ? "Edit fair" : "New fair"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit fair details" : "Create a new fair with wizard steps"}
          </DialogDescription>
        </DialogHeader>
        {stepContent}
        {actions}
      </DialogContent>
    </Dialog>
  );
}

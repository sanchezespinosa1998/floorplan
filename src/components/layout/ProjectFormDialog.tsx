import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FolderKanban, CalendarDays, MapPin, User as UserIcon, Save, X, Building2 } from "lucide-react";
import { fairs, venues, addProject, type Project, type ProjectStatus } from "@/data/mockData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const projectStatusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "borrador", label: "Borrador" },
  { value: "active", label: "Active" },
  { value: "cerrado", label: "Cerrado" },
  { value: "archivado", label: "Archivado" },
];

export function ProjectFormDialog({ open, onOpenChange, onSuccess }: ProjectFormDialogProps) {
  const [name, setName] = useState("");
  const [fairId, setFairId] = useState("");
  const [venueId, setVenueId] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("borrador");
  const [totalStands, setTotalStands] = useState(50);
  const [responsible, setResponsible] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedFair = fairs.find(f => f.id === fairId);
  const selectedVenue = venues.find(v => v.id === venueId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFair || !selectedVenue) {
      toast.error("Please select a fair and a venue");
      return;
    }

    setLoading(true);

    try {
      addProject({
        name,
        fairId,
        fairName: `${selectedFair.name} ${selectedFair.edition}`,
        venueId,
        venueName: selectedVenue.name,
        status,
        occupancy: 0,
        totalStands,
        freeStands: totalStands,
        reservedStands: 0,
        pendingReservations: 0,
        responsible: responsible || "Sin asignar",
        startDate: selectedFair.startDate,
        endDate: selectedFair.endDate,
      });
      
      toast.success(`Proyecto "${name}" creado correctamente`);
      
      // Reset form
      setName("");
      setFairId("");
      setVenueId("");
      setStatus("borrador");
      setTotalStands(50);
      setResponsible("");
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error creating project");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setFairId("");
    setVenueId("");
    setStatus("borrador");
    setTotalStands(50);
    setResponsible("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-amber-500" />
            </div>
            Nuevo proyecto
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium">
              Project name
            </Label>
            <div className="relative">
              <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="projectName"
                type="text"
                placeholder="e.g. FITUR 2027 - Main Hall"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fair" className="text-sm font-medium">
                Fair
              </Label>
              <Select value={fairId} onValueChange={setFairId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fair" />
                </SelectTrigger>
                <SelectContent>
                  {fairs.map((fair) => (
                    <SelectItem key={fair.id} value={fair.id}>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {fair.name} {fair.edition}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue" className="text-sm font-medium">
                Venue
              </Label>
              <Select value={venueId} onValueChange={setVenueId}>
                <SelectTrigger>
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Estado
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  {projectStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalStands" className="text-sm font-medium">
                Number of stands
              </Label>
              <Input
                id="totalStands"
                type="number"
                min={1}
                max={500}
                value={totalStands}
                onChange={(e) => setTotalStands(parseInt(e.target.value) || 1)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible" className="text-sm font-medium">
              Responsable
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

          {selectedFair && selectedVenue && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium">Fair:</span> {selectedFair.name} {selectedFair.edition}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Venue:</span> {selectedVenue.name}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Fechas:</span> {selectedFair.startDate} - {selectedFair.endDate}
              </p>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

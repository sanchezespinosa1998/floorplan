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
import { CalendarDays, MapPin, User as UserIcon, Save, X, Building2 } from "lucide-react";
import { fairs, venues, addFair, type Fair, type FairStatus } from "@/data/mockData";
import { toast } from "sonner";

interface FairFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const fairStatusOptions: { value: FairStatus; label: string }[] = [
  { value: "planificación", label: "Planificación" },
  { value: "comercialización", label: "Comercialización" },
  { value: "en_curso", label: "Activo" },
  { value: "finalizada", label: "Finalizado" },
];

export function FairFormDialog({ open, onOpenChange, onSuccess }: FairFormDialogProps) {
  const [name, setName] = useState("");
  const [edition, setEdition] = useState("");
  const [venueId, setVenueId] = useState("");
  const [status, setStatus] = useState<FairStatus>("planificación");
  const [totalStands, setTotalStands] = useState(50);
  const [responsible, setResponsible] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    edition?: string;
    venueId?: string;
    startDate?: string;
    endDate?: string;
  }>({});

  const selectedVenue = venues.find(v => v.id === venueId);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }
    if (!edition.trim()) {
      newErrors.edition = "La edición es obligatoria";
    }
    if (!venueId) {
      newErrors.venueId = "Selecciona una sede";
    }
    if (!startDate) {
      newErrors.startDate = "La fecha de inicio es obligatoria";
    }
    if (!endDate) {
      newErrors.endDate = "La fecha de fin es obligatoria";
    }
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      addFair({
        name,
        edition,
        venueId,
        venueName: selectedVenue.name,
        status,
        occupancy: 0,
        totalStands,
        freeStands: totalStands,
        reservedStands: 0,
        pendingReservations: 0,
        responsible: responsible || "Sin asignar",
        startDate,
        endDate,
      });

      toast.success(`Plan "${name} ${edition}" creado`);

      setName("");
      setEdition("");
      setVenueId("");
      setStatus("planificación");
      setTotalStands(50);
      setResponsible("");
      setStartDate("");
      setEndDate("");
      setErrors({});

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al crear el plan");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setEdition("");
    setVenueId("");
    setStatus("planificación");
    setTotalStands(50);
    setResponsible("");
    setStartDate("");
    setEndDate("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            Nuevo plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fairName" className="text-sm font-medium">
                Nombre *
              </Label>
              <Input
                id="fairName"
                type="text"
                placeholder="Ej: Plan Madrid Centro"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "fairName-error" : undefined}
                required
              />
              {errors.name && (
                <p id="fairName-error" className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edition" className="text-sm font-medium">
                Edición *
              </Label>
              <Input
                id="edition"
                type="text"
                placeholder="Ej: Q1 2027"
                value={edition}
                onChange={(e) => {
                  setEdition(e.target.value);
                  if (errors.edition) setErrors({ ...errors, edition: undefined });
                }}
                aria-invalid={!!errors.edition}
                aria-describedby={errors.edition ? "edition-error" : undefined}
                required
              />
              {errors.edition && (
                <p id="edition-error" className="text-xs text-destructive">{errors.edition}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue" className="text-sm font-medium">
              Sede *
            </Label>
            <Select value={venueId} onValueChange={(v) => {
              setVenueId(v);
              if (errors.venueId) setErrors({ ...errors, venueId: undefined });
            }}>
              <SelectTrigger aria-invalid={!!errors.venueId} aria-describedby={errors.venueId ? "venue-error" : undefined}>
                <SelectValue placeholder="Selecciona una sede" />
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
              <p id="venue-error" className="text-xs text-destructive">{errors.venueId}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium">
                Fecha de inicio *
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
                aria-describedby={errors.startDate ? "startDate-error" : undefined}
                required
              />
              {errors.startDate && (
                <p id="startDate-error" className="text-xs text-destructive">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">
                Fecha de fin *
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
                aria-describedby={errors.endDate ? "endDate-error" : undefined}
                required
              />
              {errors.endDate && (
                <p id="endDate-error" className="text-xs text-destructive">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Estado
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FairStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estado" />
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

            <div className="space-y-2">
              <Label htmlFor="totalStands" className="text-sm font-medium">
                Número de escritorios
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
                placeholder="Nombre del responsable"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {selectedVenue && startDate && endDate && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
              <p className="text-muted-foreground">
                <span className="font-medium">Sede:</span> {selectedVenue.name}
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">Fechas:</span> {startDate} - {endDate}
              </p>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Creando..." : "Crear plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

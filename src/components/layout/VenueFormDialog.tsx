import { useState, useEffect } from "react";
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
import { Building2, MapPin, Save, X, Ruler } from "lucide-react";
import { venues, addVenue, updateVenue, type Venue } from "@/data/mockData";
import { toast } from "sonner";

interface VenueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  venue?: Venue | null;
}

let venueIdCounter = venues.length + 1;

export function VenueFormDialog({ open, onOpenChange, onSuccess, venue }: VenueFormDialogProps) {
  const isEditing = Boolean(venue);

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState(10000);
  const [pavilions, setPavilions] = useState(1);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (venue) {
        setName(venue.name);
        setLocation(venue.location);
        setArea(venue.area);
        setPavilions(venue.pavilions);
        setDescription(venue.description || "");
      } else {
        setName("");
        setLocation("");
        setArea(10000);
        setPavilions(1);
        setDescription("");
      }
    }
  }, [open, venue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !location) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && venue) {
        updateVenue(venue.id, {
          name,
          location,
          area,
          pavilions,
          description,
        });
        toast.success(`Sede "${name}" actualizada`);
      } else {
        const newVenue: Venue = {
          id: `v${venueIdCounter++}`,
          name,
          location,
          area,
          pavilions,
          description,
          fairCount: 0,
        };
        
        venues.push(newVenue);
        toast.success(`Sede "${name}" creada`);
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(isEditing ? "Error al actualizar la sede" : "Error al crear la sede");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setLocation("");
    setArea(10000);
    setPavilions(1);
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-sky-500" />
            </div>
            {isEditing ? "Editar sede" : "Nueva sede"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="venueName" className="text-sm font-medium">
              Nombre de la sede *
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="venueName"
                type="text"
                placeholder="Ej: FlowSpace Madrid Centro"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Ubicación *
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="location"
                type="text"
                placeholder="Ej: Madrid, España"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium">
                Superficie (m²)
              </Label>
              <div className="relative">
                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="area"
                  type="number"
                  min={100}
                  value={area}
                  onChange={(e) => setArea(parseInt(e.target.value) || 100)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pavilions" className="text-sm font-medium">
                Número de plantas
              </Label>
              <Input
                id="pavilions"
                type="number"
                min={1}
                max={50}
                value={pavilions}
                onChange={(e) => setPavilions(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <textarea
              id="description"
              placeholder="Descripción de la sede..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] px-3 py-2 rounded-md border border-border bg-background text-sm outline-none focus:border-primary"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? (isEditing ? "Guardando..." : "Creando...") : (isEditing ? "Guardar cambios" : "Crear sede")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

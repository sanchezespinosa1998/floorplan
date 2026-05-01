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
import { User as UserIcon, Mail, Shield, UserPlus, Save, X, Building2 } from "lucide-react";
import { roleLabels, addUser, updateUser, type User, type UserRole } from "@/data/mockData";
import { toast } from "sonner";

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
  onSuccess?: () => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "");
  const [role, setRole] = useState<UserRole>(user?.role || "viewer");
  const [loading, setLoading] = useState(false);

  const isEditing = !!user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && user) {
        updateUser(user.id, { name, email, role, company: company.trim() || undefined });
        toast.success(`Usuario "${name}" actualizado`);
      } else {
        addUser({ name, email, role, company: company.trim() || undefined });
        toast.success(`Usuario "${name}" creado`);
      }

      setName("");
      setEmail("");
      setCompany("");
      setRole("viewer");
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Error al guardar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!isEditing) {
      setName("");
      setEmail("");
      setCompany("");
      setRole("viewer");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {isEditing ? <Shield className="h-5 w-5 text-primary" /> : <UserPlus className="h-5 w-5 text-primary" />}
            </div>
            {isEditing ? "Editar usuario" : "Nuevo usuario"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre completo
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Ej: Ana López"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Ej: usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium">
              Empresa <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="company"
                type="text"
                placeholder="Ej: TechFlow Labs"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium">
              Rol del usuario
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      {label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {role === "admin" && "Acceso completo a todas las funcionalidades del sistema"}
              {role === "architect" && "Crear y editar planes, planos y versiones"}
              {role === "commercial" && "Gestión de reservas y atención a miembros"}
              {role === "organizer" && "Seguimiento limitado del plan asignado"}
              {role === "exhibitor" && "Acceso limitado al portal del miembro"}
              {role === "viewer" && "Solo visualización, sin edición"}
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

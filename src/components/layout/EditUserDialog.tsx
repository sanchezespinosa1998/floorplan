import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { User as UserIcon, Mail, Shield, Save, X, Key } from "lucide-react";
import { roleLabels, type User, type UserRole } from "@/data/mockData";
import { toast } from "sonner";

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (userId: string, data: { name: string; email: string; role: UserRole; password?: string }) => void;
}

const roleOptions: UserRole[] = ["admin", "architect", "commercial", "organizer", "exhibitor", "viewer"];

export function EditUserDialog({ open, onOpenChange, user, onSave }: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && user) {
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [open, user]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setName("");
      setEmail("");
      setRole("viewer");
      setPassword("");
      setConfirmPassword("");
      setError("");
    }
    onOpenChange(isOpen);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio");
      return false;
    }
    if (!email.trim()) {
      setError("El email es obligatorio");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Introduce un email válido");
      return false;
    }
    if (password || confirmPassword) {
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user) return;

    setLoading(true);
    setError("");

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onSave(user.id, {
        name: name.trim(),
        email: email.trim(),
        role,
        password: password || undefined,
      });
      
      toast.success(`Usuario "${name}" actualizado`);
      handleOpenChange(false);
    } catch (err) {
      toast.error("No se pudo actualizar el usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-primary" />
            </div>
            Editar usuario
          </DialogTitle>
          <DialogDescription>
            Actualiza la información del usuario, su rol y contraseña
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="editName">Nombre completo</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="editName"
                type="text"
                placeholder="Ana López"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editEmail">Correo electrónico</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="editEmail"
                type="email"
                placeholder="ana@flowspace.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editRole">Rol</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger className="pl-10">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {roleLabels[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-3">Cambiar contraseña (deja vacío para mantener la actual)</p>

            <div className="space-y-2">
              <Label htmlFor="editPassword">Nueva contraseña</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="editPassword"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <Label htmlFor="editConfirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="editConfirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (error) setError("");
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

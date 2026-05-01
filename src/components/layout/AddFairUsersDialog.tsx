import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, Eye, Pencil, Settings, UserPlus, Users } from "lucide-react";
import { users } from "@/data/mockData";
import { toast } from "sonner";

interface AddFairUsersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fairId: string;
  currentUserIds: string[];
}

const permLabels = {
  admin: { icon: Settings, perms: ['Control total', 'Edición técnica', 'Edición comercial', 'Gestión de usuarios'] },
  architect: { icon: Shield, perms: ['Edición técnica', 'Validación de plano', 'Lectura comercial'] },
  commercial: { icon: Pencil, perms: ['Edición comercial', 'Solicitud de reservas', 'Lectura técnica'] },
  organizer: { icon: Shield, perms: ['Lectura de su plan', 'Seguimiento de reservas', 'Consulta de versiones'] },
  exhibitor: { icon: Eye, perms: ['Lectura de su escritorio', 'Consulta de documentación'] },
  viewer: { icon: Eye, perms: ['Lectura general'] },
};

export function AddFairUsersDialog({ open, onOpenChange, fairId, currentUserIds }: AddFairUsersDialogProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const availableUsers = useMemo(() => {
    return users.filter(user => !currentUserIds.includes(user.id));
  }, [users, currentUserIds]);

  const handleUserToggle = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Selecciona al menos un usuario");
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success(`${selectedUserIds.length} usuario${selectedUserIds.length !== 1 ? 's' : ''} añadido${selectedUserIds.length !== 1 ? 's' : ''} al plan`);
      
      setSelectedUserIds([]);
      onOpenChange(false);
    } catch (err) {
      toast.error("No se pudieron añadir los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedUserIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            Añadir usuarios al plan
          </DialogTitle>
          <DialogDescription>
            Selecciona usuarios del sistema para asociarlos a este plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {availableUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Todos los usuarios ya están asociados a este plan</p>
            </div>
          ) : (
            <>
              <div className="border border-border rounded-lg max-h-72 overflow-auto">
                {availableUsers.map((user) => {
                  const perm = permLabels[user.role];
                  const PermIcon = perm.icon;
                  
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleUserToggle(user.id)}
                    >
                      <Checkbox
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => handleUserToggle(user.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1">
                        <PermIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="text-xs text-muted-foreground">
                {selectedUserIds.length} usuario{selectedUserIds.length !== 1 ? 's' : ''} seleccionado{selectedUserIds.length !== 1 ? 's' : ''}
              </p>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || selectedUserIds.length === 0 || availableUsers.length === 0}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {loading ? "Añadiendo..." : "Añadir usuarios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

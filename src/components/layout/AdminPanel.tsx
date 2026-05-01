import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Settings, Users, Shield, Gauge, Building2, CalendarDays, FolderKanban, Plus, Pencil, Trash2, Mail, MapPin, Calendar, MoreHorizontal } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { roleLabels, users as allUsers, fairs, venues, deleteUser, deleteFair, type User, type Fair, type UserRole } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserFormDialog } from "./UserFormDialog";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface AdminPanelProps {
  children: React.ReactNode;
}

export function AdminPanel({ children }: AdminPanelProps) {
  const { can, isRole, availableUsers } = useProfile();
  const [open, setOpen] = useState(false);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [fairsList, setFairsList] = useState<Fair[]>([]);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("usuarios");

  const isAdmin = isRole("admin");
  const canManageUsers = can("manage_users");

  useEffect(() => {
    setUsersList([...allUsers]);
  }, [allUsers]);

  useEffect(() => {
    setFairsList([...fairs]);
  }, []);

  if (!canManageUsers) {
    return <>{children}</>;
  }

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user "${user.name}"?`)) {
      deleteUser(user.id);
      setUsersList([...allUsers]);
      toast.success(`Usuario "${user.name}" eliminado`);
    }
  };

  const handleDeleteFair = (fair: Fair) => {
    if (confirm(`Are you sure you want to delete portfolio "${fair.name}"?`)) {
      deleteFair(fair.id);
      setFairsList([...fairs]);
      toast.success(`Portfolio "${fair.name}" deleted`);
    }
  };

  const handleUserSuccess = () => {
    setUsersList([...allUsers]);
    setEditingUser(null);
  };

  const getVenueName = (venueId: string) => venues.find(v => v.id === venueId)?.name || "No mandate";

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="max-w-5xl max-h-[90dvh] w-[calc(100vw-1rem)] sm:w-full overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              Admin panel
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 py-2 border-b border-border overflow-x-auto">
            <Button
              variant={activeTab === "usuarios" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("usuarios")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Users
            </Button>
            <Button
              variant={activeTab === "ferias" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("ferias")}
              className="gap-2"
            >
              <CalendarDays className="h-4 w-4" />
              Portfolios
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant={activeTab === "roles" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("roles")}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Roles
                </Button>
                <Button
                  variant={activeTab === "sistema" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("sistema")}
                  className="gap-2"
                >
                  <Gauge className="h-4 w-4" />
                  System
                </Button>
              </>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {/* USUARIOS TAB */}
            {activeTab === "usuarios" && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{usersList.length}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{usersList.filter(u => u.role === 'architect').length}</p>
                        <p className="text-xs text-muted-foreground">Risk analysts</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{usersList.filter(u => u.role === 'commercial').length}</p>
                        <p className="text-xs text-muted-foreground">Portfolio managers</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{usersList.filter(u => u.role === 'organizer').length}</p>
                        <p className="text-xs text-muted-foreground">Organizadores</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users List */}
                <div className="bg-card rounded-lg border border-border">
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Gestión de usuarios
                      </h3>
                      <p className="text-sm text-muted-foreground">Manage users and roles across the firm</p>
                    </div>
                    <Button 
                      size="sm" 
                      className="gap-2"
                      onClick={() => {
                        setEditingUser(null);
                        setUserFormOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4" />
                      New user
                    </Button>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {usersList.map(user => (
                      <div key={user.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{user.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={cn(
                              "px-3 py-1 text-xs font-medium",
                              user.role === "admin" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                              user.role === "architect" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                              user.role === "commercial" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                              user.role === "organizer" && "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                              user.role === "exhibitor" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                              user.role === "viewer" && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                            )}>
                            {roleLabels[user.role]}
                          </Badge>
                          
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingUser(user);
                                setUserFormOpen(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteUser(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROYECTOS TAB */}
            {activeTab === "ferias" && (
              <div className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <CalendarDays className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{fairsList.length}</p>
                        <p className="text-xs text-muted-foreground">Portfolios</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{fairsList.filter(f => f.status === 'en_curso').length}</p>
                        <p className="text-xs text-muted-foreground">Live</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{venues.length}</p>
                        <p className="text-xs text-muted-foreground">Mandates</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{allUsers.length}</p>
                        <p className="text-xs text-muted-foreground">Users</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fairs List */}
                <div className="bg-card rounded-lg border border-border">
                  <div className="px-6 py-4 border-b border-border">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5" />
                        Portfolio management
                      </h3>
                      <p className="text-sm text-muted-foreground">Manage portfolios across all mandates</p>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
                    {fairsList.map(fair => (
                      <div key={fair.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                            <CalendarDays className="h-6 w-6 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{fair.name} {fair.edition}</p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                {getVenueName(fair.venueId)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={cn(
                              "px-3 py-1 text-xs font-medium",
                              fair.status === "en_curso" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                              fair.status === "comercialización" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                              fair.status === "finalizada" && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                              fair.status === "planificación" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            )}>
                            {fair.status === "en_curso" ? "Live" :
                             fair.status === "comercialización" ? "Subscriptions open" :
                             fair.status === "finalizada" ? "Closed" : "Pre-launch"}
                          </Badge>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteFair(fair)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ROLES TAB */}
            {activeTab === "roles" && isAdmin && (
              <div className="bg-card rounded-lg border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Roles & permissions
                  </h3>
                  <p className="text-sm text-muted-foreground">Role-based access control across the firm</p>
                </div>
                
                <div className="divide-y divide-border">
                  {Object.entries(roleLabels).map(([role, label]) => (
                    <div key={role} className="px-6 py-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={cn(
                            "px-3 py-1 text-xs font-medium",
                            role === "admin" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            role === "architect" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                            role === "commercial" && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                            role === "exhibitor" && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                            role === "viewer" && "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                          )}>
                          {label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {usersList.filter(u => u.role === role).length} user(s)
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role === "admin" && "Full firm access. User management, configuration, mandates and limit changes."}
                        {role === "architect" && "Risk and mandate construction. Edit allocations, draft rebalances, set risk limits."}
                        {role === "commercial" && "Trade execution, order routing, P&L attribution and client coverage."}
                        {role === "organizer" && "Compliance and audit. Pre-trade checks, regulatory reporting, oversight."}
                        {role === "exhibitor" && "Read-only beneficiary portal with their portfolio statement and key dates."}
                        {role === "viewer" && "External auditor access. Read-only across mandates with no edit rights."}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SYSTEM TAB */}
            {activeTab === "sistema" && isAdmin && (
              <div className="bg-card rounded-lg border border-border">
                <div className="px-6 py-4 border-b border-border">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    System configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">Opciones de configuración global</p>
                </div>
                
                <div className="p-6 grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">General</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">App version</span>
                        <span className="font-medium">1.0.0</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Environment</span>
                        <span className="font-medium">Production</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Modules</span>
                        <span className="font-medium">All modules active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User Form Dialog */}
      <UserFormDialog
        open={userFormOpen}
        onOpenChange={setUserFormOpen}
        user={editingUser}
        onSuccess={handleUserSuccess}
      />
    </>
  );
}

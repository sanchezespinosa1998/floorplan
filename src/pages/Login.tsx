import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { users } from "@/data/mockData";
import { getHomePathForRole } from "@/lib/authorization";

const STORAGE_KEY = "fairplan-active-user-id";
const STORAGE_KEY_FAIR = "fairplan-active-fair-id";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginByEmail = (rawEmail: string) => {
    const matchedUser = users.find(user => user.email.toLowerCase() === rawEmail.toLowerCase());

    if (!matchedUser) {
      setError("No existe un usuario demo con este email.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, matchedUser.id);
    window.localStorage.removeItem(STORAGE_KEY_FAIR);
    navigate(getHomePathForRole(matchedUser.role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, introduce tu email y contraseña.');
      return;
    }

    const matchedUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      setError("Email no reconocido para demo. Usa un email de los perfiles de prueba.");
      return;
    }

    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      loginByEmail(matchedUser.email);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-primary" />
      <div className="absolute top-0 right-0 w-32 h-32 border-r-4 border-t-4 border-primary" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-4 border-b-4 border-primary" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-primary" />

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary neon-border neon-glow mb-4">
            <MapPin className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-5xl font-bold text-foreground tracking-tighter uppercase">FloorPlan</h1>
          <p className="text-sm text-muted-foreground mt-2 font-mono tracking-widest uppercase text-xs">Management de planimetría ferial</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="bg-card border-2 border-border p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">Acceso</h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">Inicia sesión para continuar (modo demo)</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 p-4 bg-destructive/20 border-2 border-destructive text-destructive text-sm font-bold uppercase"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="text-xs font-bold text-foreground uppercase tracking-widest">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                autoComplete="email"
                className="mt-2 w-full px-4 py-4 bg-background border-2 border-border text-foreground text-sm outline-none focus:border-primary focus:neon-glow transition-all placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-bold text-foreground uppercase tracking-widest">Contraseña</label>
                <button type="button" className="text-xs text-primary hover:underline font-bold uppercase">
                  ¿Olvidaste?
                </button>
              </div>
              <div className="relative mt-2">
                <input
                  id="login-password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-4 bg-background border-2 border-border text-foreground text-sm outline-none focus:border-primary focus:neon-glow transition-all placeholder:text-muted-foreground/50 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="remember" 
                className="w-5 h-5 rounded-none border-2 border-border bg-background text-primary focus:ring-primary focus:ring-offset-0" 
              />
              <label htmlFor="remember" className="text-xs text-muted-foreground font-bold uppercase tracking-wider cursor-pointer">Recordar sesión</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-black font-bold uppercase tracking-widest text-sm hover:bg-primary/90 transition-all brutalist-shadow disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                Acceder
              </span>
              {loading && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Loader2 className="w-5 h-5 text-black animate-spin" />
                </motion.div>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-border/70">
            <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Users demo</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              maria@fairplan.com · carlos@fairplan.com · ana@fairplan.com · marta@organizacion.com · laura@expositor.com
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground mt-8 font-mono"
        >
          © 2026 FloorPlan · Management de espacios feriales
        </motion.p>
      </motion.div>
    </div>
  );
}

import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, UserPlus, Eye, EyeOff, Mail, User } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import RegisterBackground from "@/components/auth/RegisterBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/api/authApi";
import { useUserStore } from "@/store/userStore";
import { USERNAME_PATTERN, USERNAME_TITLE } from "@/features/auth/validation";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useUserStore((state) => state.setSession);
  const redirectParam = searchParams.get("redirectTo");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await register(form);
      setSession(response.user, response.accessToken);
      toast.success(`Account erstellt! Willkommen, ${response.user.username}.`);
      const redirect = redirectParam || "/forum";
      navigate(redirect, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "register_failed";
      if (message === "USER_EXISTS") {
        toast.error("E-Mail oder Benutzername ist bereits vergeben.");
      } else {
        toast.error("Registrierung fehlgeschlagen");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-16">
        <RegisterBackground />
        <motion.div 
          className="relative z-10 mx-auto w-full max-w-md space-y-6 rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(56,189,248,0.55)]"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="space-y-2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.h1 
              className="text-2xl font-bold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              Account anlegen
            </motion.h1>
            <motion.p 
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              Schließe dich der Community an.
            </motion.p>
          </motion.div>

          <motion.form 
            className="space-y-4" 
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                E-Mail
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@nexuslabs.gg"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                    disabled={loading}
                    className="pl-10 transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:focus:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  />
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-muted-foreground" htmlFor="username">
                Benutzername
              </label>
              <motion.div
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="nexus-rider"
                    value={form.username}
                    onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
                    minLength={3}
                    maxLength={20}
                    pattern={USERNAME_PATTERN}
                    title={USERNAME_TITLE}
                    required
                    disabled={loading}
                    className="pl-10 transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:focus:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  />
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                Passwort
              </label>
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  minLength={8}
                  required
                  disabled={loading}
                  className="pr-10 transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:focus:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                />
                <motion.button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  disabled={loading}
                >
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.div
                        key="eye-off"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <EyeOff className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="eye"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Eye className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden" 
                  disabled={loading}
                >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Wird erstellt...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Registrieren
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {loading && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                )}
                </Button>
              </motion.div>
            </motion.div>
          </motion.form>

          <motion.p 
            className="text-center text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.4 }}
          >
            Bereits ein Konto?{' '}
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={redirectParam ? `/login?redirectTo=${encodeURIComponent(redirectParam)}` : "/login"} 
                className="text-primary hover:underline"
              >
                Login
              </Link>
            </motion.span>
          </motion.p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Register;

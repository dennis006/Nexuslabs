import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Mail, User, UserPlus, X } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import RegisterBackground from "@/components/auth/RegisterBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/api/authApi";
import { useUserStore } from "@/store/userStore";
import { USERNAME_PATTERN, USERNAME_TITLE } from "@/features/auth/validation";
import { useAvailability, type AvailabilityStatus } from "@/features/auth/useAvailability";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import type { TranslationKey } from "@/lib/i18n/translations";

// Kawaii Icons for Password Strength
const KawaiiIcons = {
  sleeping: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" className="opacity-20"/>
      <circle cx="9" cy="9" r="1.5" className="opacity-60"/>
      <path d="M15 9c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5" className="opacity-40"/>
      <path d="M8 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-60"/>
    </svg>
  ),
  weak: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" className="text-red-300"/>
      <circle cx="9" cy="9" r="1.5" className="text-red-600"/>
      <path d="M15 9c0 1.5-1 2.5-2.5 2.5s-2.5-1-2.5-2.5" className="text-red-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M8 15h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-red-600"/>
    </svg>
  ),
  okay: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" className="text-yellow-300"/>
      <circle cx="9" cy="9" r="1.5" className="text-yellow-600"/>
      <circle cx="15" cy="9" r="1.5" className="text-yellow-600"/>
      <path d="M8 15c0-1 1-2 2-2h4c1 0 2 1 2 2" className="text-yellow-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  ),
  good: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" className="text-blue-300"/>
      <circle cx="9" cy="9" r="1.5" className="text-blue-600"/>
      <circle cx="15" cy="9" r="1.5" className="text-blue-600"/>
      <path d="M8 14c0-1 1-2 2-2h4c1 0 2 1 2 2" className="text-blue-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="17" r="1" className="text-blue-600"/>
    </svg>
  ),
  strong: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" className="text-green-300"/>
      <circle cx="9" cy="9" r="1.5" className="text-green-600"/>
      <circle cx="15" cy="9" r="1.5" className="text-green-600"/>
      <path d="M8 14c0-1 1-2 2-2h4c1 0 2 1 2 2" className="text-green-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="17" r="1" className="text-green-600"/>
      <path d="M12 6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-green-600"/>
    </svg>
  ),
  perfect: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <circle cx="12" cy="12" r="10" className="text-purple-300"/>
      <circle cx="9" cy="9" r="1.5" className="text-purple-600"/>
      <circle cx="15" cy="9" r="1.5" className="text-purple-600"/>
      <path d="M8 14c0-1 1-2 2-2h4c1 0 2 1 2 2" className="text-purple-600" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <circle cx="12" cy="17" r="1" className="text-purple-600"/>
      <path d="M12 6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-purple-600"/>
      <path d="M6 12h2M16 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-purple-600"/>
      <circle cx="12" cy="3" r="0.5" className="text-purple-600"/>
      <path d="M12 1v1M10.5 2.5l0.5 0.5M13.5 2.5l-0.5 0.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-purple-600"/>
    </svg>
  )
};

// Password Strength Indicator Component
const PasswordStrengthIndicator = ({
  password,
  t,
}: {
  password: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}) => {
  const strength = useMemo(() => {
    if (!password) return { level: 0, text: "", icon: KawaiiIcons.sleeping, color: "text-muted-foreground" };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, text: t("auth.register.passwordStrength.weak"), icon: KawaiiIcons.weak, color: "text-red-500" };
    if (score <= 2) return { level: 2, text: t("auth.register.passwordStrength.okay"), icon: KawaiiIcons.okay, color: "text-yellow-500" };
    if (score <= 3) return { level: 3, text: t("auth.register.passwordStrength.good"), icon: KawaiiIcons.good, color: "text-blue-500" };
    if (score <= 4) return { level: 4, text: t("auth.register.passwordStrength.strong"), icon: KawaiiIcons.strong, color: "text-green-500" };
    return { level: 5, text: t("auth.register.passwordStrength.perfect"), icon: KawaiiIcons.perfect, color: "text-purple-500" };
  }, [password, t]);

  return (
    <motion.div
      className="mt-2 space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ 
            scale: strength.level > 0 ? [1, 1.2, 1] : 1,
            rotate: strength.level > 3 ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 0.5 }}
        >
          {strength.icon}
        </motion.div>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.text}
        </span>
      </div>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <motion.div
            key={level}
            className={`h-2 flex-1 rounded-full ${
              level <= strength.level 
                ? strength.level === 1 ? 'bg-red-400' :
                  strength.level === 2 ? 'bg-yellow-400' :
                  strength.level === 3 ? 'bg-blue-400' :
                  strength.level === 4 ? 'bg-green-400' :
                  'bg-purple-400'
                : 'bg-muted'
            }`}
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: level <= strength.level ? 1 : 0.3,
              scaleY: level <= strength.level ? [1, 1.2, 1] : 1
            }}
            transition={{ 
              duration: 0.3, 
              delay: level * 0.1,
              scaleY: { duration: 0.5, repeat: level === strength.level ? Infinity : 0, repeatDelay: 1 }
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useUserStore((state) => state.setSession);
  const redirectParam = searchParams.get("redirectTo");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();

  const normalizedEmail = form.email.trim().toLowerCase();
  const normalizedUsername = form.username.trim();
  const {
    status,
    invalid: availabilityInvalid,
    loading: availabilityLoading,
  } = useAvailability(normalizedEmail, normalizedUsername);

  const canSubmit =
    normalizedEmail.length > 0 &&
    normalizedUsername.length >= 3 &&
    form.password.length >= 8 &&
    !availabilityInvalid &&
    !availabilityLoading;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || !canSubmit) {
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        email: normalizedEmail,
        username: normalizedUsername,
        password: form.password,
      });
      setSession(response.user, response.accessToken);
      toast.success(t("auth.register.toast.success", { name: response.user.username }));
      const redirect = redirectParam || "/forum";
      navigate(redirect, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "register_failed";
      if (message === "USER_EXISTS") {
        toast.error(t("auth.register.toast.exists"));
      } else {
        toast.error(t("auth.register.toast.error"));
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
              {t("auth.register.heading")}
            </motion.h1>
            <motion.p
              className="text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              {t("auth.register.subtitle")}
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
                {t("auth.register.email")}
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
                    aria-invalid={status.email === "taken"}
                    className="pl-10 pr-9 transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:focus:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  />
                  <StatusIcon state={status.email} />
                </div>
              </motion.div>
              {status.email === "available" && (
                <p className="mt-2 text-sm text-emerald-400">{t("auth.register.email.available")}</p>
              )}
              {status.email === "taken" && (
                <p className="mt-2 text-sm text-red-400">{t("auth.register.email.taken")}</p>
              )}
            </motion.div>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-muted-foreground" htmlFor="username">
                {t("auth.register.username")}
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
                    aria-invalid={status.username === "taken"}
                    className="pl-10 pr-9 transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:focus:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  />
                  <StatusIcon state={status.username} />
                </div>
              </motion.div>
              {status.username === "available" && (
                <p className="mt-2 text-sm text-emerald-400">{t("auth.register.username.available")}</p>
              )}
              {status.username === "taken" && (
                <p className="mt-2 text-sm text-red-400">{t("auth.register.username.taken")}</p>
              )}
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
            >
              <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                {t("auth.register.password")}
              </label>
              <motion.div 
                className="relative"
                whileFocus={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={showPassword ? t("auth.register.passwordPlaceholder") : "••••••"}
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  minLength={8}
                  required
                  disabled={loading}
                  className="pr-10 transition-all duration-300 focus:shadow-[0_0_20px_rgba(56,189,248,0.3)] dark:focus:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                />
                
                {/* Kawaii Password Toggle Button */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 -translate-y-2 w-5 h-5 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {showPassword ? (
                      <motion.button
                        key="kawaii-eye-off"
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 w-5 h-5 flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={loading}
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <circle cx="12" cy="12" r="10" className="text-orange-400"/>
                          <circle cx="9" cy="9" r="1.2" className="text-orange-700"/>
                          <circle cx="15" cy="9" r="1.2" className="text-orange-700"/>
                          <path d="M8 14c0-1 1-2 2-2h4c1 0 2 1 2 2" className="text-orange-700" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <path d="M7 7l10 10M17 7l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-600"/>
                        </svg>
                      </motion.button>
                    ) : (
                      <motion.button
                        key="kawaii-eye"
                        type="button"
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 w-5 h-5 flex items-center justify-center"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={loading}
                        initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <circle cx="12" cy="12" r="10" className="text-blue-400"/>
                          <circle cx="9" cy="9" r="1.2" className="text-blue-700"/>
                          <circle cx="15" cy="9" r="1.2" className="text-blue-700"/>
                          <path d="M8 14c0-1 1-2 2-2h4c1 0 2 1 2 2" className="text-blue-700" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                          <circle cx="12" cy="17" r="0.8" className="text-blue-700"/>
                        </svg>
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
              
              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={form.password} t={t} />
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
                  disabled={loading || !canSubmit}
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
                      {t("auth.register.loading")}
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
                      {t("auth.register.submit")}
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
            {t("auth.register.loginPrompt")}{' '}
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={redirectParam ? `/login?redirectTo=${encodeURIComponent(redirectParam)}` : "/login"}
                className="text-primary hover:underline"
              >
                {t("auth.register.loginLink")}
              </Link>
            </motion.span>
          </motion.p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

const StatusIcon = ({ state }: { state: AvailabilityStatus }) => {
  if (state === "idle") {
    return null;
  }

  return (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
      {state === "loading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      {state === "available" && <Check className="h-4 w-4 text-emerald-400" />}
      {state === "taken" && <X className="h-4 w-4 text-red-400" />}
    </span>
  );
};

export default Register;

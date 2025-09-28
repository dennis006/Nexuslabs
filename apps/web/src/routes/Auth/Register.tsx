import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import PageTransition from "@/components/layout/PageTransition";
import RegisterBackground from "@/components/auth/RegisterBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { register } from "@/lib/api/authApi";
import { useUserStore } from "@/store/userStore";
import { USERNAME_PATTERN, USERNAME_TITLE } from "@/features/auth/validation";

type KawaiiStrengthLevel = {
  label: string;
  description: string;
  icon: string;
  cardClass: string;
  labelClass: string;
  barClass: string;
};

const KAWAII_STRENGTH_LEVELS: KawaiiStrengthLevel[] = [
  {
    label: "Schnuffel-Keim",
    description: "Gib deinem Passwort etwas Liebe – mehr Zeichen, mehr Magie!",
    icon: "(｡•́︿•̀｡)",
    cardClass: "border-pink-200 bg-pink-50/80 shadow-[0_15px_40px_-25px_rgba(244,114,182,0.9)]",
    labelClass: "text-pink-600",
    barClass: "bg-pink-300",
  },
  {
    label: "Mochi-Loader",
    description: "Schon süß! Zahlen oder Großbuchstaben lassen es noch glitzern.",
    icon: "(๑˃ᴗ˂)ﻭ",
    cardClass: "border-orange-200 bg-orange-50/80 shadow-[0_15px_40px_-25px_rgba(251,146,60,0.7)]",
    labelClass: "text-orange-600",
    barClass: "bg-orange-300",
  },
  {
    label: "Kawaii Guardian",
    description: "Fast perfekt! Ein paar Sonderzeichen machen es unknackbar cute.",
    icon: "(=^･ω･^=)",
    cardClass: "border-lime-200 bg-lime-50/80 shadow-[0_15px_40px_-25px_rgba(190,242,100,0.7)]",
    labelClass: "text-lime-600",
    barClass: "bg-lime-300",
  },
  {
    label: "Stellar Mochi",
    description: "Dieses Passwort glitzert wie ein Shooting Star – kawaii & stark!",
    icon: "(ﾉ◕ヮ◕)ﾉ*:･ﾟ✧",
    cardClass: "border-purple-200 bg-purple-50/80 shadow-[0_15px_40px_-25px_rgba(192,132,252,0.7)]",
    labelClass: "text-purple-600",
    barClass: "bg-purple-400",
  },
];

const calculatePasswordStrength = (password: string) => {
  if (!password) {
    return { level: KAWAII_STRENGTH_LEVELS[0], score: 0 };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const clampedScore = Math.min(score, KAWAII_STRENGTH_LEVELS.length - 1);
  return { level: KAWAII_STRENGTH_LEVELS[clampedScore], score: Math.min(score, 4) };
};

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useUserStore((state) => state.setSession);
  const redirectParam = searchParams.get("redirectTo");
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => calculatePasswordStrength(form.password), [form.password]);

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
        <div className="relative z-10 mx-auto w-full max-w-md space-y-6 rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(56,189,248,0.55)]">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Account anlegen</h1>
            <p className="text-sm text-muted-foreground">Schließe dich der Community an.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
                E-Mail
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@nexuslabs.gg"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="username">
                Benutzername
              </label>
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
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
                Passwort
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="｡ﾟʕっ•ᴥ•ʔっﾟ｡"
                  className="pr-20"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                  minLength={8}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 my-1 flex items-center rounded-full bg-white/80 px-3 text-xs font-semibold text-primary shadow-[0_8px_20px_-12px_rgba(248,113,113,0.8)] transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-pressed={showPassword}
                >
                  {showPassword ? "☆ verstecken ☆" : "☆ zeigen ☆"}
                </button>
              </div>
              <div
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${passwordStrength.level.cardClass}`}
                aria-live="polite"
              >
                <span className="text-xl" aria-hidden="true">
                  {passwordStrength.level.icon}
                </span>
                <div className="flex-1 space-y-2">
                  <div className="space-y-1">
                    <p className={`text-sm font-semibold ${passwordStrength.level.labelClass}`}>
                      {passwordStrength.level.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{passwordStrength.level.description}</p>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${passwordStrength.level.barClass}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird erstellt..." : "Registrieren"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Bereits ein Konto?{' '}
            <Link to={redirectParam ? `/login?redirectTo=${encodeURIComponent(redirectParam)}` : "/login"} className="text-primary">
              Login
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Register;

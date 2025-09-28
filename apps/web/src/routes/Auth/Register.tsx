import type { FormEvent } from "react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
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
              <Input
                id="password"
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                minLength={8}
                required
                disabled={loading}
              />
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

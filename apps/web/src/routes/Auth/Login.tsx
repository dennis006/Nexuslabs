import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import PageTransition from "@/components/layout/PageTransition";
import AuthBackground from "@/components/auth/AuthBackground";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/authApi";
import { useUserStore } from "@/store/userStore";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setSession = useUserStore((state) => state.setSession);
  const user = useUserStore((state) => state.user);
  const token = useUserStore((state) => state.accessToken);
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      const redirect = searchParams.get("redirectTo") || "/forum";
      navigate(redirect, { replace: true });
    }
  }, [user, token, navigate, searchParams]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await login(form);
      setSession(response.user, response.accessToken);
      toast.success(`Willkommen zurück, ${response.user.username}!`);
      const redirect = searchParams.get("redirectTo") || "/forum";
      navigate(redirect, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "login_failed";
      if (message === "INVALID_CREDENTIALS") {
        toast.error("E-Mail/Benutzername oder Passwort sind falsch.");
      } else {
        toast.error("Login fehlgeschlagen");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-16">
        <AuthBackground />
        <div className="relative z-10 mx-auto w-full max-w-md space-y-6 rounded-3xl border border-border/50 bg-card/80 p-8 backdrop-blur-xl shadow-[0_25px_70px_-30px_rgba(56,189,248,0.55)]">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Willkommen zurück</h1>
            <p className="text-sm text-muted-foreground">Melde dich an, um mitzudiskutieren.</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="emailOrUsername">
                E-Mail oder Benutzername
              </label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="you@nexuslabs.gg"
                value={form.emailOrUsername}
                onChange={(event) => setForm((prev) => ({ ...prev, emailOrUsername: event.target.value }))}
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
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Wird geprüft..." : "Login"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            Noch kein Konto? <Link to="/register" className="text-primary">Registrieren</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;

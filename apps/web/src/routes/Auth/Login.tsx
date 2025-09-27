import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageTransition from "@/components/layout/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/api/authApi";
import { useUserStore } from "@/store/userStore";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useUserStore((state) => state.setSession);
  const [form, setForm] = useState({ emailOrUsername: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await login(form);
      setSession(response.user, response.accessToken);
      toast.success(`Willkommen zurück, ${response.user.username}!`);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? "/forum";
      navigate(redirectTo, { replace: true });
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
      <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-border/60 bg-card/70 p-8">
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
    </PageTransition>
  );
};

export default Login;

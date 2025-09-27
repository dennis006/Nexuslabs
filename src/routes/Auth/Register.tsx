import PageTransition from "@/components/layout/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Register = () => (
  <PageTransition>
    <div className="mx-auto max-w-md space-y-6 rounded-3xl border border-border/60 bg-card/70 p-8">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Account erstellen</h1>
        <p className="text-sm text-muted-foreground">Schalte exklusive Bereiche frei.</p>
      </div>
      <form className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="name">
            Nutzername
          </label>
          <Input id="name" placeholder="Dein Gamer Tag" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="email">
            E-Mail
          </label>
          <Input id="email" type="email" placeholder="you@nexuslabs.gg" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="password">
            Passwort
          </label>
          <Input id="password" type="password" placeholder="••••••" required />
        </div>
        <Button type="submit" className="w-full">
          Registrieren
        </Button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        Bereits Mitglied? <Link to="/login" className="text-primary">Login</Link>
      </p>
    </div>
  </PageTransition>
);

export default Register;

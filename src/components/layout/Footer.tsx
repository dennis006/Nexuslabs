import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/60 bg-background/60">
    <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
      <p>&copy; {new Date().getFullYear()} NexusLabs. Für Gamer gebaut.</p>
      <div className="flex items-center gap-4">
        <Link to="/forum" className="hover:text-foreground">
          Forum
        </Link>
        <Link to="/create" className="hover:text-foreground">
          Neuer Thread
        </Link>
        <Link to="/register" className="hover:text-foreground">
          Registrieren
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;

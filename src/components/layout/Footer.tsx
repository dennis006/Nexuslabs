import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/60 bg-background/60">
    <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8 2xl:max-w-[1720px] 2xl:px-10 3xl:max-w-[1880px]">
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

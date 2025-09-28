import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import HeroSection from "@/components/hero/HeroSection";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import { useGsapScrollReveal } from "@/lib/animations/gsapScroll";

const features = [
  {
    title: "Next-Gen Forum Experience",
    description: "Kombiniert klassische Thread-Struktur mit modernen Echtzeit-Features.",
    icon: Sparkles
  },
  {
    title: "Live Presence",
    description: "Sieh jederzeit, wer online ist und welche Diskussionen brennen.",
    icon: Shield
  },
  {
    title: "Pro Play Insights",
    description: "Community-Guides, Scrim-Planung und Balance-Diskussionen auf einen Blick.",
    icon: ArrowRight
  }
];

const Landing = () => {

  const [stats, setStats] = useState<Stats | null>(null);
  const [particlesReady, setParticlesReady] = useState(false);
  useGsapScrollReveal("[data-animate-card]");

  return (
    <PageTransition>

      <HeroSection />
      <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/80 via-background/60 to-background/90 py-24">
        {particlesReady && (
          <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
            <Particles id="tsparticles" options={particleOptions} />
          </div>
        )}
        <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-12 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <Link
              to="/forum"
              className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary transition hover:border-primary/60 hover:bg-primary/15"
              aria-label="NexusLabs – The Next-Gen Gaming Forum"
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              NEXUSLABS – THE NEXT-GEN GAMING FORUM
            </Link>
            <TypewriterTitle
              text="Verbinde dich mit der Elite der Gaming-Community"
              className="mx-auto mb-6 max-w-[1100px] text-center"
              loop={false}
            />
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Diskutiere Meta-Strategien, organisiere Scrims und erhalte Insights direkt aus der Szene. Mit Live-Presence, animierten Statistiken und einem Dock-Chat bleibst du immer verbunden.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="group" asChild>
                <Link to="/forum">
                  <span>Forum betreten</span>
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Konto erstellen</Link>
              </Button>
            </div>
            {stats ? (
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                {stats.usersTotal.toLocaleString("de-DE")} Mitglieder • {stats.usersOnline} online • {stats.threadsTotal} Threads aktiv
              </p>
            ) : null}
          </motion.div>
        </div>
      </section>
      <section className="mx-auto mt-16 grid w-full max-w-screen-2xl gap-6 px-4 md:grid-cols-3 md:gap-7">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur supports-[backdrop-filter]:bg-card/60"
            data-animate-card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <feature.icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </section>
    </PageTransition>
  );
};

export default Landing;

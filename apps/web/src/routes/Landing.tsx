import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import TypewriterTitle from "@/components/TypewriterTitle";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import { useGsapScrollReveal } from "@/lib/animations/gsapScroll";
import { mockApi } from "@/lib/api/mockApi";
import type { Stats } from "@/lib/api/types";

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
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [particlesReady, setParticlesReady] = useState(false);
  useGsapScrollReveal("[data-animate-card]");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await mockApi.getStats();
        if (alive) {
          setStats(data);
        }
      } catch (e) {
        console.warn("fetchStats failed", e);
        if (alive) {
          setStats({
            usersTotal: 0,
            usersOnline: 0,
            categoriesTotal: 0,
            threadsTotal: 0,
            postsTotal: 0,
            messagesTotal: 0
          });
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setParticlesReady(true));
  }, []);

  const particleOptions = useMemo<ISourceOptions>(
    () => ({
      background: { color: { value: "transparent" } },
      fullScreen: { enable: false },
      particles: {
        number: { value: 60, density: { enable: true, area: 800 } },
        move: { enable: true, speed: 1 },
        links: { enable: true, opacity: 0.3, distance: 140 },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } }
      },
      interactivity: {
        events: { onHover: { enable: true, mode: "repulse" } },
        modes: { repulse: { distance: 100 } }
      }
    }),
    []
  );

  return (
    <PageTransition>
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
            <span className="mx-auto inline-flex items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
              NexusLabs – The Next-Gen Gaming Forum
            </span>
            <TypewriterTitle
              text="Verbinde dich mit der Elite der Gaming-Community"
              className="mx-auto mb-6 max-w-[1100px] text-center"
            />
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Diskutiere Meta-Strategien, organisiere Scrims und erhalte Insights direkt aus der Szene. Mit Live-Presence, animierten Statistiken und einem Dock-Chat bleibst du immer verbunden.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/forum")}
                className="group">
                <span>Forum betreten</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                Konto erstellen
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

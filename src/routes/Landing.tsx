import { useCallback } from "react";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import { Particles } from "react-tsparticles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PageTransition from "@/components/layout/PageTransition";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import { useGsapScrollReveal } from "@/lib/animations/gsapScroll";
import { mockApi } from "@/lib/api/mockApi";
import { useEffect, useState } from "react";
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
  useGsapScrollReveal("[data-animate-card]");

  useEffect(() => {
    const fetchStats = async () => {
      const data = await mockApi.getStats();
      setStats(data);
    };
    void fetchStats();
  }, []);

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <PageTransition>
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/80 via-background/60 to-background/90 py-24">
        <Particles
          id="tsparticles"
          init={particlesInit}
          className="absolute inset-0 -z-10"
          options={{
            fullScreen: { enable: false },
            background: { color: "transparent" },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: true, mode: "push" }
              },
              modes: {
                repulse: { distance: 80 },
                push: { quantity: 2 }
              }
            },
            particles: {
              color: { value: ["#00E0FF", "#7C3AED"] },
              links: { enable: true, color: "#7C3AED", opacity: 0.4, distance: 130 },
              move: { enable: true, speed: 1.2 },
              number: { value: 80 },
              opacity: { value: 0.6 },
              size: { value: { min: 1, max: 3 } }
            }
          }}
        />
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs uppercase tracking-wide text-primary">
              NexusLabs – The Next-Gen Gaming Forum
            </span>
            <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
              Verbinde dich mit der Elite der Gaming-Community
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Diskutiere Meta-Strategien, organisiere Scrims und erhalte Insights direkt aus der Szene. Mit Live-Presence, animierten Statistiken und einem Dock-Chat bleibst du immer verbunden.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate("/forum")}
                className="group">
                <span>Enter Forum</span>
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/register")}>
                Create Account
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
      <section className="mx-auto mt-16 grid w-full max-w-5xl gap-6 px-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="rounded-3xl border border-border/60 bg-card/70 p-6"
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

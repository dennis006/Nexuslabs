import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import TypewriterTitle from "@/components/TypewriterTitle";
import { mockApi } from "@/lib/api/mockApi";
import type { Stats } from "@/lib/api/types";

export default function HeroSection() {
  const [particlesReady, setParticlesReady] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
      setParticlesReady(true);
    });
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      const data = await mockApi.getStats();
      setStats(data);
    };
    fetchStats();
  }, []);

  const particleOptions = useMemo<ISourceOptions>(
    () => ({
      background: {
        color: {
          value: "transparent"
        }
      },
      fullScreen: { enable: false }, // Wichtig: Particles nur im Container
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push"
          },
          onHover: {
            enable: true,
            mode: "repulse"
          }
        },
        modes: {
          push: {
            quantity: 4
          },
          repulse: {
            distance: 200,
            duration: 0.4
          }
        }
      },
      particles: {
        color: {
          value: ["#06b6d4", "#3b82f6", "#8b5cf6"]
        },
        links: {
          color: "#06b6d4",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce"
          },
          random: false,
          speed: 1,
          straight: false
        },
        number: {
          density: {
            enable: true
          },
          value: 60 // Reduziert für bessere Performance
        },
        opacity: {
          value: 0.5
        },
        shape: {
          type: "circle"
        },
        size: {
          value: { min: 1, max: 3 }
        }
      },
      detectRetina: true
    }),
    []
  );

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-background/80 via-background/60 to-background/90">
      {/* Background-Layer (Particles etc.) */}
      {particlesReady && (
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-3xl" aria-hidden="true">
          <Particles id="tsparticles" options={particleOptions} />
        </div>
      )}

      {/* Foreground-Content */}
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 text-center">
        {/* === BADGE ÜBER DER ÜBERSCHRIFT === */}
        <Link
          to="/forum"
          className="mx-auto mb-5 inline-flex w-auto items-center gap-2 rounded-full
                     border border-cyan-400/30 bg-cyan-400/10 px-3 py-1
                     text-xs font-semibold tracking-wide text-cyan-200
                     shadow-[0_0_20px_rgba(34,211,238,0.15)]"
          aria-label="NexusLabs – The Next-Gen Gaming Forum"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
          NEXUSLABS – THE NEXT-GEN GAMING FORUM
        </Link>

        {/* === HEADLINE === */}
        <TypewriterTitle
          text="Verbinde dich mit der Elite der Gaming-Community"
          className="mx-auto inline-block"
        />

        {/* === SUBCOPY === */}
        <p className="mx-auto mt-6 max-w-[820px] text-base sm:text-lg leading-relaxed text-slate-200/90">
          Diskutiere Meta-Strategien, organisiere Scrims und erhalte Insights direkt
          aus der Szene. Mit Live-Presence, animierten Statistiken und einem Dock-
          Chat bleibst du immer verbunden.
        </p>

        {/* === CTAS === */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/forum"
            className="inline-flex items-center justify-center rounded-xl bg-cyan-400/90 px-5 py-3
                       font-semibold text-slate-900 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            Forum betreten →
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-5 py-3
                       font-semibold text-slate-100 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            Konto erstellen
          </Link>
        </div>

        {/* === STATISTIKEN === */}
        {stats && (
          <p className="mt-6 text-sm uppercase tracking-wide text-muted-foreground">
            {stats.usersTotal.toLocaleString("de-DE")} MITGLIEDER • {stats.usersOnline} ONLINE • {stats.threadsTotal} THREADS AKTIV
          </p>
        )}
      </div>
    </section>
  );
}

// In src/pages/Landing.tsx:
// import HeroSection from "@/components/hero/HeroSection";
// export default function Landing() {
//   return (
//     <main className="px-4 sm:px-6 lg:px-8">
//       <HeroSection />
//       {/* ...restlicher Content... */}
//     </main>
//   );
// }

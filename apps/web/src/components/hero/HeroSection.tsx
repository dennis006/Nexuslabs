import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import TypewriterTitle from "@/components/TypewriterTitle";
import { mockApi } from "@/lib/api/mockApi";
import type { Stats } from "@/lib/api/types";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

export default function HeroSection() {
  const [particlesReady, setParticlesReady] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const { t, locale } = useTranslation();

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
          value: ["#0ea5e9", "#3b82f6", "#8b5cf6", "#6366f1"]
        },
        links: {
          color: "#0ea5e9",
          distance: 150,
          enable: true,
          opacity: 0.3,
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
          value: 0.6
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
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* === BADGE ÜBER DER ÜBERSCHRIFT === */}
          <Link
            to="/forum"
            className="inline-flex items-center gap-2 rounded-full
                       border border-primary/40 bg-primary/10 px-3 py-1
                       text-xs font-semibold tracking-wide text-primary
                       shadow-[0_0_20px_rgba(34,211,238,0.15)] dark:shadow-[0_0_20px_rgba(34,211,238,0.15)]"
            aria-label={t("landing.hero.badge")}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            {t("landing.hero.badge")}
          </Link>

          {/* === HEADLINE === */}
          <div className="w-full flex justify-center">
            <TypewriterTitle text={t("landing.hero.headline")} />
          </div>

          {/* === SUBCOPY === */}
          <p className="max-w-[820px] text-base sm:text-lg leading-relaxed text-muted-foreground">
            {t("landing.hero.subcopy")}
          </p>

          {/* === CTAS === */}
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/forum"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3
                         font-semibold text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {t("landing.hero.primaryCta")}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3
                         font-semibold text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {t("landing.hero.secondaryCta")}
            </Link>
          </div>

          {/* === STATISTIKEN === */}
          {stats && (
            <p className="text-sm uppercase tracking-wide text-muted-foreground">
              {t("landing.hero.stats", {
                users: stats.usersTotal.toLocaleString(locale),
                online: stats.usersOnline.toLocaleString(locale),
                threads: stats.threadsTotal.toLocaleString(locale)
              })}
            </p>
          )}
        </div>
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

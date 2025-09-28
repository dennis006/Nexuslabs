import { Link } from "react-router-dom";
import TypewriterTitle from "@/components/TypewriterTitle";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      {/* Background-Layer (Particles etc.) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* <Particles /> */}
      </div>

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

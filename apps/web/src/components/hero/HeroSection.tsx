import TypewriterTitle from "@/components/TypewriterTitle";
import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* <Particles /> */}
      </div>

      <div className="relative z-10 mx-auto flex max-w-[1200px] flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold tracking-wide text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden />
          <span>NexusLabs – The Next-Gen Gaming Forum</span>
        </div>

        <TypewriterTitle
          text="Verbinde dich mit der Elite der Gaming-Community"
          className="mx-auto inline-block text-center"
        />

        <p className="mx-auto mt-6 max-w-[820px] text-base sm:text-lg leading-relaxed text-slate-200/90">
          Tauche ein in exklusive Diskussionen, sichere dir Early-Access zu brandneuen Titeln
          und triff die besten Spieler:innen der Szene. Nexuslabs verbindet Leidenschaft,
          Fortschritt und eine Community, die Gaming ernst nimmt.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Jetzt beitreten
          </Link>
          <Link
            to="/forum"
            className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-slate-900/40 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/70 hover:bg-slate-900/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            Mehr entdecken
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

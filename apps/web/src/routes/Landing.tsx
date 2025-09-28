import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import HeroSection from "@/components/hero/HeroSection";
import { Sparkles, ArrowRight, Shield } from "lucide-react";
import { useGsapScrollReveal } from "@/lib/animations/gsapScroll";
import { useTranslation } from "@/lib/i18n/TranslationProvider";

const features = [
  {
    titleKey: "landing.features.nextGen.title" as const,
    descriptionKey: "landing.features.nextGen.description" as const,
    icon: Sparkles
  },
  {
    titleKey: "landing.features.livePresence.title" as const,
    descriptionKey: "landing.features.livePresence.description" as const,
    icon: Shield
  },
  {
    titleKey: "landing.features.proPlay.title" as const,
    descriptionKey: "landing.features.proPlay.description" as const,
    icon: ArrowRight
  }
];

const Landing = () => {
  useGsapScrollReveal("[data-animate-card]");
  const { t } = useTranslation();

  return (
    <PageTransition>
      <HeroSection />
      <section className="mx-auto mt-16 grid w-full max-w-screen-2xl gap-6 px-4 md:grid-cols-3 md:gap-7">
        {features.map((feature, index) => (
          <motion.div
            key={feature.titleKey}
            className="rounded-3xl border border-border/60 bg-card/70 p-6 text-center backdrop-blur supports-[backdrop-filter]:bg-card/60"
            data-animate-card
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            <feature.icon className="mb-4 h-8 w-8 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">{t(feature.titleKey)}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t(feature.descriptionKey)}</p>
          </motion.div>
        ))}
      </section>
    </PageTransition>
  );
};

export default Landing;

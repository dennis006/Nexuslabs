import { motion } from "framer-motion";
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
  useGsapScrollReveal("[data-animate-card]");

  return (
    <PageTransition>
      <HeroSection />
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

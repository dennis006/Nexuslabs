import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register once globally
if (typeof window !== "undefined" && !gsap.core.globals()["ScrollTrigger"]) {
  gsap.registerPlugin(ScrollTrigger);
}

export const useGsapScrollReveal = (selector: string) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(selector).forEach((card, index) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            delay: index * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%"
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, [selector]);
};

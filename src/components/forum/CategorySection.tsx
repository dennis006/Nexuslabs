import { motion } from "framer-motion";
import CategoryCard from "@/components/forum/CategoryCard";
import type { Category } from "@/lib/api/types";

const gridVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.04
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } }
};

interface CategorySectionProps {
  categories: Category[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  return (
    <section
      className="
        [--card-min:280px]
        sm:[--card-min:300px]
        xl:[--card-min:320px]
        2xl:[--card-min:340px]
        space-y-4
      "
    >
      {/* Toolbar (Suche/Sort/Filter) hier, optional sticky */}

      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="
          grid
          [grid-template-columns:repeat(auto-fit,minmax(var(--card-min),1fr))]
          gap-5 xl:gap-6 2xl:gap-7
        "
      >
        {categories.map((c) => (
          <motion.div key={`cat_${c.id}`} variants={cardVariants}>
            <CategoryCard category={c} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Dumbbell, Gamepad2, Home, Lamp, Laptop, LayoutGrid, Shirt, Sparkles,
} from 'lucide-react';
import { getMediaUrl } from '@/lib/siteConfig';

const ICON_RULES = [
  [/electron|laptop|phone|computer/, Laptop],
  [/fashion|cloth|apparel|wear/, Shirt],
  [/home|living|furniture/, Home],
  [/beauty|personal|care/, Sparkles],
  [/sport|outdoor|fitness/, Dumbbell],
  [/book/, BookOpen],
  [/toy|game/, Gamepad2],
  [/show|decor|piece/, Lamp],
];

const MotionLink = motion(Link);

const row = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const tile = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

function iconFor(category) {
  const haystack = `${category.slug || ''} ${category.name || ''}`.toLowerCase();
  const match = ICON_RULES.find(([pattern]) => pattern.test(haystack));
  return match ? match[1] : LayoutGrid;
}

export default function CategoryIconRow({ categories = [] }) {
  const list = Array.isArray(categories) ? categories : [];
  if (list.length === 0) return null;

  return (
    <section className="bg-cream-200">
      <div className="container-custom pb-2">
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3"
          variants={row}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {list.map((category) => {
            const Icon = iconFor(category);
            return (
              <MotionLink
                key={category.id}
                href={`/category/${category.slug}`}
                variants={tile}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white rounded-xl border border-cream-400 shadow-sm px-2 py-4 flex flex-col items-center gap-2 text-center"
              >
                <span className="w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center overflow-hidden">
                  {category.image ? (
                    <img src={getMediaUrl(category.image)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </span>
                <span className="text-xs sm:text-sm font-medium text-charcoal-800 leading-tight line-clamp-2">
                  {category.name}
                </span>
              </MotionLink>
            );
          })}
          <MotionLink
            href="/products"
            variants={tile}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-xl border border-cream-400 shadow-sm px-2 py-4 flex flex-col items-center gap-2 text-center"
          >
            <span className="w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6" />
            </span>
            <span className="text-xs sm:text-sm font-medium text-charcoal-800">More</span>
          </MotionLink>
        </motion.div>
      </div>
    </section>
  );
}

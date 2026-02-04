import { motion } from 'framer-motion';
import { Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Quick delivery inside Dhaka within 24 hours and outside Dhaka within 3-5 days',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    description: 'Multiple secure payment options including bKash, Nagad, and Card payments',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Hassle-free returns within 7 days of delivery for eligible products',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our customer support team is always ready to help you with any queries',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-charcoal-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />
      </div>

      <div className="container-custom relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className="relative bg-charcoal-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gold-500/10 hover:border-gold-500/30 hover:bg-charcoal-800/80 transition-all duration-500 h-full overflow-hidden">
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gold-500 to-gold-600 text-charcoal-950 rounded-2xl mb-6 shadow-lg shadow-gold-500/20"
                  >
                    <feature.icon className="w-7 h-7" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-xl font-bold text-cream-100 mb-3 group-hover:text-gold-400 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-cream-500 leading-relaxed text-sm group-hover:text-cream-400 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Corner decoration */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-600 opacity-5 rounded-full group-hover:opacity-10 group-hover:scale-150 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

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
    <section className="py-16 md:py-20 bg-white relative overflow-hidden border-y border-charcoal-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl" />
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
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className="relative bg-cream-50 rounded-2xl p-8 border border-charcoal-100 hover:border-gold-300 hover:shadow-lg transition-all duration-500 h-full overflow-hidden">
                {/* Hover gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-gold-500 to-gold-400 text-white rounded-xl mb-5 shadow-lg shadow-gold-500/20"
                  >
                    <feature.icon className="w-6 h-6" strokeWidth={2} />
                  </motion.div>

                  <h3 className="text-lg font-bold text-charcoal-800 mb-2 group-hover:text-gold-600 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-charcoal-500 leading-relaxed text-sm group-hover:text-charcoal-600 transition-colors">
                    {feature.description}
                  </p>
                </div>

                {/* Corner decoration */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-gold-500 to-gold-400 opacity-5 rounded-full group-hover:opacity-10 group-hover:scale-150 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

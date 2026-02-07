import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal-950">
      {/* Background ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/3 w-96 h-96 bg-gold-500/20 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold-600/15 rounded-full blur-[80px]"
        />
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <img
            src="/images/logo.png"
            alt="Zzuhana"
            className="h-14 md:h-16 w-auto"
          />
        </motion.div>

        {/* Animated line loader */}
        <div className="relative w-48 h-[2px] bg-charcoal-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-gold-500 to-transparent"
          />
        </div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-6 text-cream-500 text-sm tracking-widest uppercase font-medium"
        >
          Loading
        </motion.p>
      </div>
    </div>
  );
}

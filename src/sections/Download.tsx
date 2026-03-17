import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Apple, Play, Sparkles, Star, Download, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const stats = [
  { value: '4.9', label: 'App Store', icon: Star },
  { value: '4.8', label: 'Play Store', icon: Star },
  { value: '50K+', label: 'Téléchargements', icon: Download },
];

export default function DownloadSection() {
  const sectionRef = useRef(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const shouldReduceFx = isMobile || reduceMotion;
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="download" className="relative py-32 bg-dark overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${shouldReduceFx ? 'w-[480px] h-[480px] bg-gold/8 blur-2xl' : 'w-[1000px] h-[1000px] bg-gold/10 blur-3xl'}`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/5 to-transparent" />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {/* Main Card */}
          <div className="relative bg-dark-surface rounded-3xl border border-gold/20 p-8 sm:p-12 lg:p-16 overflow-hidden">
            {/* Glow Effect */}
            {!shouldReduceFx && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/20 rounded-full blur-3xl" />}
            
            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-gold text-sm font-medium">Disponible maintenant</span>
              </motion.div>

              {/* Headline */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6"
              >
                Téléchargez <span className="text-gradient">Coifly</span>
              </motion.h2>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg text-text-secondary max-w-xl mx-auto mb-10"
              >
                Rejoignez plus de 50 000 utilisateurs qui simplifient leurs réservations 
                coiffure chaque jour. Gratuit et disponible sur iOS et Android.
              </motion.p>

              {/* Download Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              >
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <Apple className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs opacity-70">Télécharger sur</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="#"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-white text-black rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <Play className="w-8 h-8 fill-black" />
                  <div className="text-left">
                    <div className="text-xs opacity-70">Disponible sur</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </a>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="flex flex-wrap justify-center gap-8"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-2">
                    <stat.icon className="w-5 h-5 text-gold" />
                    <div className="text-left">
                      <div className="text-white font-bold">{stat.value}</div>
                      <div className="text-text-muted text-xs">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-10 flex items-center justify-center gap-2 text-text-muted text-sm"
              >
                <Shield className="w-4 h-4 text-gold" />
                <span>Paiement sécurisé · Sans engagement · Annulation gratuite</span>
              </motion.div>
            </div>
          </div>

          {/* Floating Elements */}
          {!shouldReduceFx && (
            <>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-8 -left-8 w-20 h-20 bg-gold/20 rounded-2xl backdrop-blur-sm border border-gold/30 flex items-center justify-center"
              >
                <span className="text-3xl">✨</span>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -right-8 w-20 h-20 bg-gold/20 rounded-2xl backdrop-blur-sm border border-gold/30 flex items-center justify-center"
              >
                <span className="text-3xl">💇</span>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}

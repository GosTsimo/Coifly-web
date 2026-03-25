import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, Sparkles, Calendar, Star, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

// Particle Component
const Particle = ({ delay, index, reduced }: { delay: number; index: number; reduced?: boolean }) => {
  const randomX = (index * 37) % 100;
  const randomY = (index * 53) % 100;
  const duration = reduced ? 5 : 3 + ((index * 17) % 4);
  
  return (
    <motion.div
      className="absolute w-1 h-1 bg-gold rounded-full"
      style={{ left: `${randomX}%`, top: `${randomY}%` }}
      animate={{
        y: [0, -100, 0],
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Floating Element
const FloatingElement = ({ 
  children, 
  delay = 0, 
  duration = 6,
  className = ""
}: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number;
  className?: string;
}) => (
  <motion.div
    className={className}
    animate={{
      y: [0, -20, 0],
      rotate: [-2, 2, -2],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// Glow Orb
const GlowOrb = ({ 
  className, 
  color = "gold",
  size = 300 
}: { 
  className?: string; 
  color?: string;
  size?: number;
}) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${className}`}
    style={{
      width: size,
      height: size,
      background: color === "gold" 
        ? 'radial-gradient(circle, rgba(195, 156, 86, 0.3) 0%, transparent 70%)'
        : 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)',
    }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.5, 0.8, 0.5],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Phone Mockup
const PhoneMockup = () => {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 100, rotateY: -30 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Phone Frame */}
      <div className="relative w-[280px] h-[570px] mx-auto">
        {/* Outer Glow */}
        <div className="absolute -inset-4 bg-gradient-gold rounded-[3rem] opacity-20 blur-2xl" />
        
        {/* Phone Body */}
        <div className="relative w-full h-full bg-dark-surface rounded-[2.5rem] border-4 border-gold/30 overflow-hidden shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl z-10" />
          
          {/* Screen Content */}
          <div className="relative w-full h-full bg-[#0f0f0f] p-4 pt-10 flex flex-col">
            {/* App Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                <span className="text-gold text-xs font-bold">K</span>
              </div>
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold" />
                <span className="text-gold text-xs font-bold tracking-widest">COIFLY</span>
              </div>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-gold text-xs">🔔</span>
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
              </div>
            </div>

            {/* Greeting */}
            <div className="mb-3">
              <div className="text-text-muted text-xs">Bonjour 👋</div>
              <div className="text-white font-bold text-sm">Karim</div>
            </div>

            {/* Next Booking Card */}
            <div className="relative bg-gradient-to-br from-[#c39c56] to-[#a07c3a] rounded-2xl p-4 mb-4 overflow-hidden">
              <div className="absolute right-3 top-3 opacity-10">
                <Users className="w-12 h-12 text-black" />
              </div>
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="w-3 h-3 text-black/70" />
                <span className="text-black/70 text-[10px] font-semibold uppercase tracking-wide">Prochain RDV</span>
              </div>
              <div className="text-black font-bold text-base leading-tight">Barber Club</div>
              <div className="text-black/80 text-xs mt-0.5">✂️ Coupe + Barbe · 14:00</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1 bg-black/10 rounded-full px-2 py-0.5">
                  <Star className="w-2.5 h-2.5 text-black fill-black" />
                  <span className="text-black text-[10px] font-bold">4.9</span>
                </div>
                <span className="text-black font-extrabold text-sm">150 MAD</span>
              </div>
            </div>

            {/* Nearby Barbers */}
            <div className="mb-3 flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-xs font-bold">Près de toi</div>
                <div className="text-gold text-[10px]">Voir tout</div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Elite Barber', service: 'Coupe + Fondu', price: '80', rating: '4.9', wait: '5 min' },
                  { name: 'Kings Cut', service: 'Rasage · Barbe', price: '60', rating: '4.7', wait: '12 min' },
                ].map((barber, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold/40 to-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold font-bold text-xs">{barber.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-[11px] font-semibold truncate">{barber.name}</div>
                      <div className="text-text-muted text-[9px]">{barber.service}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-gold text-[10px] font-bold">{barber.price} MAD</div>
                      <div className="flex items-center gap-0.5 justify-end">
                        <Star className="w-2 h-2 text-gold fill-gold" />
                        <span className="text-text-muted text-[9px]">{barber.rating}</span>
                      </div>
                      <div className="text-green-400 text-[8px]">⏱ {barber.wait}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="flex items-center justify-around bg-white/5 border border-white/10 rounded-2xl p-2.5">
              {[
                { icon: '🏠', active: true },
                { icon: '🔍', active: false },
                { icon: '📅', active: false },
                { icon: '👤', active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    item.active ? 'bg-gold/20 border border-gold/30' : ''
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Reflection */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none rounded-r-[2.5rem]" />
      </div>
    </motion.div>
  );
};

// Stat Card
const StatCard = ({ 
  icon: Icon, 
  value, 
  label, 
  delay 
}: { 
  icon: React.ElementType; 
  value: string; 
  label: string; 
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-3 bg-dark-surface/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-gold/10"
  >
    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
      <Icon className="w-5 h-5 text-gold" />
    </div>
    <div>
      <div className="text-white font-bold text-lg">{value}</div>
      <div className="text-text-muted text-xs">{label}</div>
    </div>
  </motion.div>
);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const reduceEffects = isMobile || prefersReducedMotion;
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section 
      ref={containerRef}
      id="hero" 
      className="relative min-h-screen flex items-center overflow-hidden bg-dark"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent" />
        
        {/* Glow Orbs */}
        {!reduceEffects ? (
          <>
            <GlowOrb className="top-20 -left-32" size={500} />
            <GlowOrb className="bottom-20 -right-32" color="secondary" size={400} />
            <GlowOrb className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={600} />
          </>
        ) : (
          <GlowOrb className="top-20 -left-32" size={280} />
        )}
        
        {/* Particles */}
        {!reduceEffects ? (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(24)].map((_, i) => (
              <Particle key={i} delay={i * 0.2} index={i} />
            ))}
          </div>
        ) : null}
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(195, 156, 86, 0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(195, 156, 86, 0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        style={reduceEffects ? undefined : { y, opacity }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Text */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">La révolution de la coiffure</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6"
            >
              Réservez votre{' '}
              <span className="text-gradient">coiffeur</span>
              <br />
              en quelques clics
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-text-secondary max-w-xl mx-auto lg:mx-0 mb-8"
            >
              Coifly connecte clients, coiffeurs et salons sur une plateforme 
              intelligente. Simplifiez vos réservations et développez votre activité.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12"
            >
              <a
                href="https://github.com/GosTsimo/Coifly-web/releases/download/v1.0.6/Coifly-v1.0.6.apk"
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                Télécharger l'app
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#demo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-dark-surface text-white font-semibold rounded-xl border border-gold/30 hover:border-gold/60 transition-all duration-300 hover:-translate-y-1"
              >
                <Play className="w-5 h-5 text-gold" />
                Voir la démo
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
            >
              <StatCard icon={Users} value="50K+" label="Utilisateurs" delay={0.5} />
              <StatCard icon={Star} value="4.9" label="Note moyenne" delay={0.6} />
              <StatCard icon={Calendar} value="200K+" label="Réservations" delay={0.7} />
            </motion.div>
          </div>

          {/* Right Column - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <PhoneMockup />
            
            {/* Floating Elements Around Phone */}
            {!reduceEffects ? (
              <>
                <FloatingElement 
                  delay={0} 
                  duration={5}
                  className="absolute -top-4 -left-4 lg:left-0"
                >
                  <div className="bg-dark-surface/80 backdrop-blur-sm rounded-xl p-3 border border-gold/20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-500 text-lg">✓</span>
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Réservation confirmée</div>
                        <div className="text-text-muted text-xs">Il y a 2 min</div>
                      </div>
                    </div>
                  </div>
                </FloatingElement>
                
                <FloatingElement 
                  delay={1} 
                  duration={6}
                  className="absolute top-1/4 -right-4 lg:right-0"
                >
                  <div className="bg-dark-surface/80 backdrop-blur-sm rounded-xl p-3 border border-gold/20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <Star className="w-4 h-4 text-gold fill-gold" />
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">Nouvel avis 5★</div>
                        <div className="text-text-muted text-xs">Beauty Luxe</div>
                      </div>
                    </div>
                  </div>
                </FloatingElement>
                
                <FloatingElement 
                  delay={2} 
                  duration={5.5}
                  className="absolute -bottom-4 left-1/4"
                >
                  <div className="bg-dark-surface/80 backdrop-blur-sm rounded-xl p-3 border border-gold/20 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                        <span className="text-gold text-lg">💰</span>
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">+850 MAD</div>
                        <div className="text-text-muted text-xs">Aujourd'hui</div>
                      </div>
                    </div>
                  </div>
                </FloatingElement>
              </>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent pointer-events-none" />
    </section>
  );
}

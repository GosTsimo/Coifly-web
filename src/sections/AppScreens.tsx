import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Smartphone } from 'lucide-react';

const screens = [
  {
    id: 1,
    title: 'Accueil',
    description: 'Votre tableau de bord personnalisé avec vos prochains rendez-vous et favoris.',
    color: 'from-gold/30 to-gold/5',
  },
  {
    id: 2,
    title: 'Recherche',
    description: 'Trouvez les meilleurs salons avec filtres avancés et carte interactive.',
    color: 'from-blue-500/30 to-blue-500/5',
  },
  {
    id: 3,
    title: 'Réservation',
    description: 'Réservez en quelques clics avec choix du service, coiffeur et horaire.',
    color: 'from-green-500/30 to-green-500/5',
  },
  {
    id: 4,
    title: 'Détail Salon',
    description: 'Consultez les avis, services, photos et disponibilités en temps réel.',
    color: 'from-purple-500/30 to-purple-500/5',
  },
  {
    id: 5,
    title: 'Mes RDV',
    description: 'Gérez tous vos rendez-vous, modifiez ou annulez en un clic.',
    color: 'from-pink-500/30 to-pink-500/5',
  },
];

// Phone Screen Component
const PhoneScreen = ({ 
  screen, 
  isActive,
  index,
  total
}: { 
  screen: typeof screens[0]; 
  isActive: boolean;
  index: number;
  total: number;
}) => {
  const getTransform = () => {
    if (isActive) return 'translateX(0) scale(1) rotateY(0deg)';
    const offset = index - Math.floor(total / 2);
    const direction = offset > 0 ? 1 : -1;
    const absOffset = Math.abs(offset);
    return `translateX(${offset * 60}%) scale(${1 - absOffset * 0.15}) rotateY(${direction * -15 * absOffset}deg)`;
  };

  const getZIndex = () => {
    if (isActive) return 10;
    return 10 - Math.abs(index - Math.floor(total / 2));
  };

  const getOpacity = () => {
    if (isActive) return 1;
    const offset = Math.abs(index - Math.floor(total / 2));
    return 1 - offset * 0.3;
  };

  return (
    <motion.div
      className="absolute w-[260px] h-[540px]"
      style={{
        transform: getTransform(),
        zIndex: getZIndex(),
        opacity: getOpacity(),
        left: '50%',
        marginLeft: '-130px',
      }}
      animate={{
        transform: getTransform(),
        opacity: getOpacity(),
      }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Phone Frame */}
      <div className="relative w-full h-full">
        {/* Glow */}
        {isActive && (
          <div className={`absolute -inset-4 bg-gradient-to-br ${screen.color} rounded-[3rem] blur-2xl opacity-50`} />
        )}
        
        {/* Phone Body */}
        <div className="relative w-full h-full bg-dark-surface rounded-[2.5rem] border-4 border-gold/30 overflow-hidden shadow-2xl">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-10" />
          
          {/* Screen Content */}
          <div className={`relative w-full h-full bg-gradient-to-b ${screen.color} p-4 pt-8`}>
            {/* Screen-specific content */}
            {screen.id === 1 && (
              <div className="h-full">
                {/* Home Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold text-xs font-bold">M</span>
                  </div>
                  <span className="text-white text-xs">📍 Casablanca</span>
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold text-xs">🔔</span>
                  </div>
                </div>
                
                {/* Next Booking */}
                <div className="bg-dark-surface/80 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gold text-xs">📅 Prochain RDV</span>
                  </div>
                  <div className="text-white font-bold">Beauty Luxe</div>
                  <div className="text-text-secondary text-sm">Coupe femme · 14:00</div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      <span className="text-gold text-xs">⭐ 4.8</span>
                    </div>
                    <span className="text-gold font-bold text-sm">120 MAD</span>
                  </div>
                </div>
                
                {/* Favorites */}
                <div className="text-white text-sm font-medium mb-3">Mes favoris</div>
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-16 h-20 rounded-xl bg-dark-surface/80 overflow-hidden">
                      <div className="h-10 bg-gradient-to-br from-gold/30 to-gold/10" />
                      <div className="p-2">
                        <div className="text-white text-[10px] truncate">Salon {i}</div>
                        <div className="text-gold text-[8px]">⭐ 4.{i + 5}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 2 && (
              <div className="h-full">
                {/* Search Bar */}
                <div className="bg-dark-surface/80 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
                  <span className="text-text-muted text-sm">🔍</span>
                  <span className="text-text-muted text-xs">Rechercher...</span>
                </div>
                
                {/* Filters */}
                <div className="flex gap-2 mb-3">
                  {['Tous', 'Ouvert', 'Note'].map((f, i) => (
                    <div key={f} className={`px-2 py-1 rounded-full text-[10px] ${i === 0 ? 'bg-gold text-black' : 'bg-dark-surface/80 text-text-secondary'}`}>
                      {f}
                    </div>
                  ))}
                </div>
                
                {/* Results */}
                <div className="space-y-2">
                  {['Beauty Luxe', 'Nadia Hair', 'Prestige'].map((name, i) => (
                    <div key={name} className="bg-dark-surface/80 rounded-xl p-2 flex gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold/30 to-gold/10" />
                      <div className="flex-1">
                        <div className="text-white text-xs font-medium">{name}</div>
                        <div className="flex items-center gap-1">
                          <span className="text-gold text-[10px]">⭐ {4.5 + i * 0.2}</span>
                          <span className="text-text-muted text-[10px]">· {1 + i * 0.5}km</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 3 && (
              <div className="h-full">
                {/* Booking Steps */}
                <div className="text-white text-sm font-medium mb-3">Nouvelle réservation</div>
                
                {/* Stepper */}
                <div className="flex items-center justify-between mb-4">
                  {['Service', 'Coiffeur', 'Horaire'].map((s, i) => (
                    <div key={s} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                        i === 0 ? 'bg-gold text-black' : 'bg-dark-surface/80 text-text-muted'
                      }`}>
                        {i === 0 ? '✓' : i + 1}
                      </div>
                      <span className="text-[8px] text-text-muted mt-1">{s}</span>
                    </div>
                  ))}
                </div>
                
                {/* Services */}
                <div className="space-y-2">
                  {['Coupe homme', 'Dégradé', 'Barbe'].map((service, i) => (
                    <div key={service} className={`rounded-xl p-3 ${i === 1 ? 'bg-gold/20 border border-gold/30' : 'bg-dark-surface/80'}`}>
                      <div className="flex items-center justify-between">
                        <div className="text-white text-xs">{service}</div>
                        <div className={`w-4 h-4 rounded-full border ${i === 1 ? 'bg-gold border-gold' : 'border-text-muted'} flex items-center justify-center`}>
                          {i === 1 && <span className="text-black text-[10px]">✓</span>}
                        </div>
                      </div>
                      <div className="text-gold text-[10px] mt-1">{80 + i * 20} MAD · {20 + i * 10} min</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 4 && (
              <div className="h-full">
                {/* Salon Header */}
                <div className="h-24 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 mb-3" />
                
                {/* Info */}
                <div className="bg-dark-surface/80 rounded-xl p-3 mb-3">
                  <div className="text-white font-bold text-sm">Beauty Luxe</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gold text-xs">⭐ 4.8</span>
                    <span className="text-text-muted text-xs">(124 avis)</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-green-500 text-[10px]">Ouvert · Ferme à 19:00</span>
                  </div>
                </div>
                
                {/* Services */}
                <div className="text-white text-xs font-medium mb-2">Services</div>
                <div className="space-y-1">
                  {['Coupe femme - 120 MAD', 'Brushing - 80 MAD'].map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-dark-surface/80 rounded-lg px-2 py-1.5">
                      <span className="text-text-secondary text-[10px]">{s}</span>
                      <div className="w-5 h-5 rounded-lg bg-gold flex items-center justify-center">
                        <span className="text-black text-xs">+</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 5 && (
              <div className="h-full">
                {/* Tabs */}
                <div className="flex gap-2 mb-3">
                  {['À venir', 'Historique'].map((t, i) => (
                    <div key={t} className={`px-3 py-1 rounded-full text-[10px] ${i === 0 ? 'bg-gold text-black' : 'bg-dark-surface/80 text-text-secondary'}`}>
                      {t}
                    </div>
                  ))}
                </div>
                
                {/* Bookings */}
                <div className="space-y-2">
                  {[
                    { salon: 'Beauty Luxe', service: 'Coupe', date: '12 mars', status: 'confirmed' },
                    { salon: 'Nadia Hair', service: 'Brushing', date: '15 mars', status: 'pending' },
                  ].map((b, i) => (
                    <div key={i} className="bg-dark-surface/80 rounded-xl p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold/30 to-gold/10" />
                        <div className="flex-1">
                          <div className="text-white text-xs font-medium">{b.salon}</div>
                          <div className="text-text-secondary text-[10px]">{b.service} · {b.date}</div>
                        </div>
                        <div className={`px-2 py-0.5 rounded-full text-[8px] ${
                          b.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {b.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function AppScreens() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const [activeIndex, setActiveIndex] = useState(2);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % screens.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + screens.length) % screens.length);
  };

  return (
    <section className="relative py-32 bg-dark overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-3xl" />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6"
          >
            <Smartphone className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">L'application</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Une expérience <span className="text-gradient">fluide</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Découvrez l'interface intuitive qui rend chaque réservation simple et agréable.
          </motion.p>
        </div>

        {/* 3D Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          {/* Carousel Container */}
          <div className="relative h-[600px] flex items-center justify-center" style={{ perspective: '1000px' }}>
            <AnimatePresence mode="popLayout">
              {screens.map((screen, index) => (
                <PhoneScreen
                  key={screen.id}
                  screen={screen}
                  isActive={index === activeIndex}
                  index={index}
                  total={screens.length}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full bg-dark-surface border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {screens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'w-8 bg-gold' : 'bg-gold/30 hover:bg-gold/50'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full bg-dark-surface border border-gold/30 flex items-center justify-center text-gold hover:bg-gold/10 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Screen Info */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mt-8"
          >
            <h3 className="text-2xl font-bold text-white mb-2">
              {screens[activeIndex].title}
            </h3>
            <p className="text-text-secondary max-w-md mx-auto">
              {screens[activeIndex].description}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

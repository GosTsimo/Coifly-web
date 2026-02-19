import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Smartphone, Calendar, Star, Users, Clock, Scissors, TrendingUp, Bell, Settings, CheckCircle } from 'lucide-react';

const screens = [
  {
    id: 1,
    title: 'Dashboard Barbier',
    description: 'Tableau de bord complet pour les barbiers avec stats, RDV et actions rapides.',
    color: 'from-gold/30 to-gold/5',
  },
  {
    id: 2,
    title: 'Réservations du jour',
    description: 'Gérez les rendez-vous du jour : confirmez, annulez ou consultez en temps réel.',
    color: 'from-green-500/30 to-green-500/5',
  },
  {
    id: 3,
    title: 'Dashboard Salon',
    description: 'Vue d\'ensemble pour les propriétaires de salon avec revenus et planning.',
    color: 'from-blue-500/30 to-blue-500/5',
  },
  {
    id: 4,
    title: 'Recherche',
    description: 'Trouvez les meilleurs barbiers et salons près de chez vous.',
    color: 'from-purple-500/30 to-purple-500/5',
  },
  {
    id: 5,
    title: 'Profil & Services',
    description: 'Personnalisez vos services, tarifs et horaires de disponibilité.',
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
          <div className={`relative w-full h-full bg-[#0B0B0F] p-3 pt-8 overflow-hidden`}>
            {/* Screen-specific content */}
            {screen.id === 1 && (
              <div className="h-full flex flex-col">
                {/* Barber Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold text-xs font-bold">A</span>
                    </div>
                    <div>
                      <div className="text-white text-[11px] font-bold">Ahmed</div>
                      <div className="text-text-muted text-[9px]">Barber Luxe</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-green-400 text-[9px]">Disponible</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="bg-[#1C1C1E] rounded-xl p-2 border-l-2 border-gold">
                    <Users className="w-3 h-3 text-gold mb-1" />
                    <div className="text-white text-sm font-bold">5</div>
                    <div className="text-text-muted text-[8px]">Clients</div>
                  </div>
                  <div className="bg-[#1C1C1E] rounded-xl p-2 border-l-2 border-green-500">
                    <TrendingUp className="w-3 h-3 text-green-400 mb-1" />
                    <div className="text-white text-sm font-bold">700</div>
                    <div className="text-text-muted text-[8px]">MAD</div>
                  </div>
                  <div className="bg-[#1C1C1E] rounded-xl p-2 border-l-2 border-yellow-500">
                    <Clock className="w-3 h-3 text-yellow-400 mb-1" />
                    <div className="text-white text-sm font-bold">2</div>
                    <div className="text-text-muted text-[8px]">En attente</div>
                  </div>
                </div>

                {/* Next Booking */}
                <div className="bg-gradient-to-br from-[#c39c56] to-[#a07c3a] rounded-2xl p-3 mb-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-black/60" />
                    <span className="text-black/60 text-[9px] font-semibold uppercase tracking-wide">Prochain RDV</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-black font-bold text-sm">Yassine</div>
                      <div className="text-black/70 text-[10px]">Dégradé · 10:00</div>
                    </div>
                    <div className="text-black font-extrabold text-sm">120 MAD</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[
                    { icon: Calendar, label: 'Planning', color: 'text-gold' },
                    { icon: Scissors, label: 'Services', color: 'text-blue-400' },
                    { icon: Clock, label: 'Horaires', color: 'text-yellow-400' },
                    { icon: Users, label: 'Clients', color: 'text-green-400' },
                  ].map((a, i) => (
                    <div key={i} className="bg-[#1C1C1E] rounded-lg p-2 flex flex-col items-center">
                      <a.icon className={`w-4 h-4 ${a.color} mb-1`} />
                      <span className="text-text-muted text-[7px]">{a.label}</span>
                    </div>
                  ))}
                </div>

                {/* Notifications */}
                <div className="text-white text-[10px] font-semibold mb-1.5">Notifications</div>
                <div className="space-y-1">
                  {[
                    { text: 'Nouveau RDV reçu', time: 'Il y a 5 min', icon: Calendar },
                    { text: 'Avis client reçu', time: 'Il y a 1h', icon: Star },
                  ].map((n, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#1C1C1E] rounded-lg p-2">
                      <div className="w-6 h-6 rounded-md bg-gold/10 flex items-center justify-center">
                        <n.icon className="w-3 h-3 text-gold" />
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-[9px]">{n.text}</div>
                        <div className="text-text-muted text-[8px]">{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 2 && (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="text-white text-xs font-bold mb-3">Réservations du jour</div>

                {/* Bookings List */}
                <div className="space-y-2 flex-1">
                  {[
                    { time: '10:00', client: 'Yassine', service: 'Dégradé', status: 'confirmed', price: 120 },
                    { time: '11:00', client: 'Karim', service: 'Barbe', status: 'pending', price: 80 },
                    { time: '13:00', client: 'Hamza', service: 'Coupe', status: 'confirmed', price: 100 },
                    { time: '15:00', client: 'Mehdi', service: 'Fade', status: 'pending', price: 150 },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#1C1C1E] rounded-xl p-2.5">
                      <div className="bg-[#2C2C2E] rounded-lg px-2 py-1.5 text-center min-w-[40px]">
                        <div className="text-gold text-[10px] font-bold">{b.time}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white text-[10px] font-medium">{b.client}</div>
                        <div className="text-text-muted text-[9px]">{b.service}</div>
                      </div>
                      {b.status === 'pending' ? (
                        <div className="flex gap-1">
                          <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          </div>
                          <div className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-500 text-[10px] font-bold">✕</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-green-500/10 rounded-full px-2 py-0.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-green-400 text-[8px]">Confirmé</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 3 && (
              <div className="h-full flex flex-col">
                {/* Salon Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center">
                      <span className="text-gold text-xs font-bold">B</span>
                    </div>
                    <div>
                      <div className="text-white text-[11px] font-bold">Barber Club</div>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-green-400 text-[8px]">Ouvert · 09:00 - 19:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Bell className="w-4 h-4 text-gold" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-1.5 mb-3">
                  <div className="bg-[#1C1C1E] rounded-xl p-2 text-center">
                    <Calendar className="w-3 h-3 text-gold mx-auto mb-1" />
                    <div className="text-white text-sm font-bold">6</div>
                    <div className="text-text-muted text-[8px]">RDV</div>
                  </div>
                  <div className="bg-[#1C1C1E] rounded-xl p-2 text-center">
                    <TrendingUp className="w-3 h-3 text-green-400 mx-auto mb-1" />
                    <div className="text-white text-sm font-bold">1200</div>
                    <div className="text-text-muted text-[8px]">MAD</div>
                  </div>
                  <div className="bg-[#1C1C1E] rounded-xl p-2 text-center">
                    <Clock className="w-3 h-3 text-yellow-400 mx-auto mb-1" />
                    <div className="text-white text-sm font-bold">2</div>
                    <div className="text-text-muted text-[8px]">En attente</div>
                  </div>
                </div>

                {/* Next Booking */}
                <div className="bg-gradient-to-br from-[#c39c56] to-[#a07c3a] rounded-2xl p-3 mb-3">
                  <div className="text-black/60 text-[9px] font-semibold uppercase tracking-wide mb-1">Prochain RDV</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-black font-bold text-sm">Adam</div>
                      <div className="text-black/70 text-[10px]">Coupe + Barbe · 10:00</div>
                    </div>
                    <div className="text-black font-extrabold text-sm">100 MAD</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-4 gap-1.5 mb-3">
                  {[
                    { icon: '+', label: 'Créneau' },
                    { icon: '✂', label: 'Services' },
                    { icon: '⏰', label: 'Horaires' },
                    { icon: '📅', label: 'Calendrier' },
                  ].map((a, i) => (
                    <div key={i} className="bg-[#1C1C1E] rounded-lg p-2 flex flex-col items-center">
                      <span className="text-gold text-sm mb-0.5">{a.icon}</span>
                      <span className="text-text-muted text-[7px]">{a.label}</span>
                    </div>
                  ))}
                </div>

                {/* Today's bookings */}
                <div className="text-white text-[10px] font-semibold mb-1.5">Aujourd'hui</div>
                <div className="space-y-1">
                  {[
                    { time: '10:00', client: 'Adam', service: 'Coupe + Barbe', status: 'confirmed' },
                    { time: '11:00', client: 'Omar', service: 'Dégradé', status: 'pending' },
                  ].map((b, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#1C1C1E] rounded-lg p-2">
                      <div className="text-gold text-[9px] font-bold min-w-[30px]">{b.time}</div>
                      <div className="flex-1">
                        <div className="text-white text-[9px] font-medium">{b.client}</div>
                        <div className="text-text-muted text-[8px]">{b.service}</div>
                      </div>
                      <div className={`w-1.5 h-1.5 rounded-full ${b.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 4 && (
              <div className="h-full flex flex-col">
                {/* Search Header */}
                <div className="bg-[#1C1C1E] rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2 border border-[#2C2C2E]">
                  <span className="text-text-muted text-sm">🔍</span>
                  <span className="text-text-muted text-[10px]">Rechercher un barbier...</span>
                </div>
                
                {/* Filters */}
                <div className="flex gap-1.5 mb-3">
                  {['Tous', 'Ouvert', 'Proche', 'Top noté'].map((f, i) => (
                    <div key={f} className={`px-2 py-1 rounded-full text-[8px] ${i === 0 ? 'bg-gold text-black font-bold' : 'bg-[#1C1C1E] text-text-muted border border-[#2C2C2E]'}`}>
                      {f}
                    </div>
                  ))}
                </div>
                
                {/* Results */}
                <div className="space-y-2 flex-1">
                  {[
                    { name: 'Elite Barber', rating: '4.9', dist: '0.5 km', price: '80 MAD', status: 'Ouvert' },
                    { name: 'Kings Cut', rating: '4.7', dist: '1.2 km', price: '60 MAD', status: 'Ouvert' },
                    { name: 'Barber Luxe', rating: '4.8', dist: '2.1 km', price: '120 MAD', status: 'Fermé' },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#1C1C1E] rounded-xl p-2.5 border border-[#2C2C2E]">
                      <div className="flex gap-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold/30 to-gold/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-gold font-bold text-xs">{s.name[0]}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="text-white text-[10px] font-semibold">{s.name}</div>
                            <div className="text-gold text-[9px] font-bold">{s.price}</div>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-2 h-2 text-gold fill-gold" />
                              <span className="text-text-muted text-[8px]">{s.rating}</span>
                            </div>
                            <span className="text-text-muted text-[8px]">· {s.dist}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className={`w-1 h-1 rounded-full ${s.status === 'Ouvert' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className={`text-[7px] ${s.status === 'Ouvert' ? 'text-green-400' : 'text-red-400'}`}>{s.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {screen.id === 5 && (
              <div className="h-full flex flex-col">
                {/* Profile Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center">
                    <span className="text-gold font-bold text-sm">A</span>
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">Ahmed</div>
                    <div className="text-gold text-[9px]">Barbier · Barber Luxe</div>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className="w-2 h-2 text-gold fill-gold" />
                      <span className="text-text-muted text-[8px]">4.9 (124 avis)</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div className="text-white text-[10px] font-semibold mb-2">Mes services</div>
                <div className="space-y-1.5 mb-3">
                  {[
                    { name: 'Dégradé', price: '120 MAD', duration: '30 min' },
                    { name: 'Coupe classique', price: '80 MAD', duration: '20 min' },
                    { name: 'Barbe', price: '60 MAD', duration: '15 min' },
                    { name: 'Fade', price: '150 MAD', duration: '45 min' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-[#1C1C1E] rounded-lg px-3 py-2 border border-[#2C2C2E]">
                      <div>
                        <div className="text-white text-[10px] font-medium">{s.name}</div>
                        <div className="text-text-muted text-[8px]">{s.duration}</div>
                      </div>
                      <div className="text-gold text-[10px] font-bold">{s.price}</div>
                    </div>
                  ))}
                </div>

                {/* Menu */}
                <div className="text-white text-[10px] font-semibold mb-2">Paramètres</div>
                <div className="space-y-1">
                  {[
                    { icon: Clock, label: 'Mes horaires' },
                    { icon: Bell, label: 'Notifications' },
                    { icon: Settings, label: 'Paramètres' },
                  ].map((m, i) => (
                    <div key={i} className="flex items-center gap-2 bg-[#1C1C1E] rounded-lg px-3 py-2 border border-[#2C2C2E]">
                      <m.icon className="w-3 h-3 text-gold" />
                      <span className="text-white text-[9px]">{m.label}</span>
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

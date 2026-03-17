import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Star,
  Check,
  Scissors,
  Clock,
  Wallet,
  Bell
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const benefits = [
  {
    icon: Calendar,
    title: 'Planning intelligent',
    description: 'Gérez vos disponibilités et recevez des réservations automatiquement.',
  },
  {
    icon: Wallet,
    title: 'Revenus optimisés',
    description: 'Augmentez votre chiffre d\'affaires avec moins de créneaux vides.',
  },
  {
    icon: Users,
    title: 'Fidélisation client',
    description: 'Gardez le contact avec vos clients et encouragez les revenus.',
  },
  {
    icon: Star,
    title: 'Visibilité accrue',
    description: 'Soyez visible par des milliers de clients potentiels dans votre zone.',
  },
];

const stats = [
  { value: '+40%', label: 'Revenus moyens' },
  { value: '-30%', label: 'Créneaux vides' },
  { value: '50K+', label: 'Clients actifs' },
];

export default function ForBarbers() {
  const sectionRef = useRef(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const shouldReduceFx = isMobile || reduceMotion;
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="barbers" className="relative py-32 bg-dark-surface overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 right-0 rounded-full ${shouldReduceFx ? 'w-[420px] h-[420px] bg-gold/5 blur-2xl' : 'w-[800px] h-[800px] bg-gold/5 blur-3xl'}`} />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6"
          >
            <Scissors className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">Pour les coiffeurs</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Développez votre <span className="text-gradient">clientèle</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Rejoignez la communauté Coifly et transformez votre activité. 
            Plus de clients, moins d'attente, plus de revenus.
          </motion.p>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mb-20"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl sm:text-5xl font-bold text-gradient mb-2">{stat.value}</div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              {/* Glow */}
              {!shouldReduceFx && <div className="absolute -inset-10 bg-gold/10 rounded-full blur-3xl" />}
              
              {/* Dashboard Card */}
              <div className="relative bg-dark rounded-3xl border border-gold/20 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center">
                      <span className="text-gold font-bold text-lg">A</span>
                    </div>
                    <div>
                      <div className="text-white font-bold">Ahmed</div>
                      <div className="text-text-muted text-sm">Barber Luxe</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full bg-green-500 ${shouldReduceFx ? '' : 'animate-pulse'}`} />
                    <span className="text-green-500 text-sm">Disponible</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-dark-surface rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-gold" />
                    </div>
                    <div className="text-2xl font-bold text-white">5</div>
                    <div className="text-text-muted text-xs">Clients</div>
                  </div>
                  <div className="bg-dark-surface rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">700</div>
                    <div className="text-text-muted text-xs">MAD</div>
                  </div>
                  <div className="bg-dark-surface rounded-xl p-4 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Clock className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="text-2xl font-bold text-white">2</div>
                    <div className="text-text-muted text-xs">En attente</div>
                  </div>
                </div>

                {/* Next Appointment */}
                <div className="bg-gradient-gold rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-black/70" />
                      <span className="text-black/70 text-sm font-medium">Prochain RDV</span>
                    </div>
                    <span className="text-black font-bold">120 MAD</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                      <span className="text-black font-bold">Y</span>
                    </div>
                    <div>
                      <div className="text-black font-bold">Yassine</div>
                      <div className="text-black/70 text-sm">Dégradé · 10:00</div>
                    </div>
                  </div>
                </div>

                {/* Today's List */}
                <div className="text-white text-sm font-medium mb-3">Aujourd'hui</div>
                <div className="space-y-2">
                  {[
                    { time: '10:00', client: 'Yassine', service: 'Dégradé', status: 'pending' },
                    { time: '11:00', client: 'Karim', service: 'Barbe', status: 'confirmed' },
                    { time: '13:00', client: 'Hamza', service: 'Coupe', status: 'confirmed' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-surface rounded-lg p-3">
                      <div className="text-gold font-medium text-sm w-12">{apt.time}</div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{apt.client}</div>
                        <div className="text-text-muted text-xs">{apt.service}</div>
                      </div>
                      {apt.status === 'pending' ? (
                        <div className="flex gap-1">
                          <div className="w-7 h-7 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Check className="w-4 h-4 text-green-500" />
                          </div>
                          <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <span className="text-red-500 text-lg leading-none">×</span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating Notification */}
              {!shouldReduceFx && (
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-dark rounded-xl p-3 border border-gold/20 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-gold" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Nouveau RDV</div>
                      <div className="text-text-muted text-xs">15:00 - Coupe</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right - Benefits */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="order-1 lg:order-2"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Pourquoi rejoindre <span className="text-gradient">Coifly ?</span>
            </h3>
            
            <p className="text-text-secondary mb-10">
              En tant que coiffeur indépendant ou salon, Coifly vous donne les outils 
              pour gérer votre activité comme un pro et attirer plus de clients.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-4 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                    <benefit.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-gold transition-colors">
                      {benefit.title}
                    </h4>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 1 }}
              className="mt-10"
            >
              <a
                href="#join"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:-translate-y-1"
              >
                Devenir partenaire
                <TrendingUp className="w-5 h-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

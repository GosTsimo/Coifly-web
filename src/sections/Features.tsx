import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Scissors, 
  BarChart3, 
  Bell, 
  MapPin,
  Clock,
  Star,
  Shield,
  Zap
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const features = [
  {
    icon: Calendar,
    title: 'Réservation Intelligente',
    description: 'Réservez votre coiffeur préféré en quelques clics, 24h/24 et 7j/7. Annulation gratuite jusqu\'à 2h avant.',
    color: 'from-gold/20 to-gold/5',
    iconColor: 'text-gold',
  },
  {
    icon: MapPin,
    title: 'Géolocalisation',
    description: 'Trouvez les meilleurs salons près de chez vous avec notre carte interactive et les avis clients.',
    color: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-400',
  },
  {
    icon: Clock,
    title: 'Planning en Temps Réel',
    description: 'Visualisez les disponibilités en temps réel et choisissez le créneau qui vous convient.',
    color: 'from-green-500/20 to-green-500/5',
    iconColor: 'text-green-400',
  },
  {
    icon: Star,
    title: 'Avis Vérifiés',
    description: 'Consultez les avis authentiques de clients et partagez votre propre expérience.',
    color: 'from-yellow-500/20 to-yellow-500/5',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Recevez des rappels automatiques pour ne jamais manquer votre rendez-vous.',
    color: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
  },
  {
    icon: Shield,
    title: 'Paiement Sécurisé',
    description: 'Payez en toute sécurité directement dans l\'app avec cryptage de bout en bout.',
    color: 'from-red-500/20 to-red-500/5',
    iconColor: 'text-red-400',
  },
];

const barberFeatures = [
  {
    icon: BarChart3,
    title: 'Dashboard Analytics',
    description: 'Suivez vos revenus, vos performances et l\'évolution de votre activité en temps réel.',
  },
  {
    icon: Users,
    title: 'Gestion Clients',
    description: 'Gérez votre clientèle, consultez l\'historique et fidélisez vos meilleurs clients.',
  },
  {
    icon: Scissors,
    title: 'Services Personnalisés',
    description: 'Définissez vos services, tarifs et durées pour une gestion optimale.',
  },
  {
    icon: Zap,
    title: 'Confirmation Instantanée',
    description: 'Acceptez ou refusez les réservations en un clic, directement depuis votre téléphone.',
  },
];

const FeatureCard = ({ 
  feature, 
  index,
  shouldReduceFx
}: { 
  feature: typeof features[0]; 
  index: number;
  shouldReduceFx: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative"
    >
      <div className="relative h-full bg-dark-surface rounded-2xl p-6 border border-gold/10 overflow-hidden transition-all duration-500 hover:border-gold/30 hover:shadow-card-hover">
        {/* Gradient Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} ${shouldReduceFx ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-500`} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-gold/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
            <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">
            {feature.title}
          </h3>
          
          {/* Description */}
          <p className="text-text-secondary leading-relaxed">
            {feature.description}
          </p>
        </div>
        
        {/* Corner Glow */}
        {!shouldReduceFx && <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />}
      </div>
    </motion.div>
  );
};

const BarberFeatureCard = ({ 
  feature, 
  index 
}: { 
  feature: typeof barberFeatures[0]; 
  index: number;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0">
        <feature.icon className="w-6 h-6 text-gold" />
      </div>
      <div>
        <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
        <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
      </div>
    </motion.div>
  );
};

export default function Features() {
  const sectionRef = useRef(null);
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const shouldReduceFx = Boolean(isMobile) || Boolean(reduceMotion);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative py-32 bg-dark overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 rounded-full ${shouldReduceFx ? 'w-64 h-64 bg-gold/5 blur-2xl' : 'w-96 h-96 bg-gold/5 blur-3xl'}`} />
        <div className={`absolute bottom-0 right-1/4 rounded-full ${shouldReduceFx ? 'w-64 h-64 bg-gold/5 blur-2xl' : 'w-96 h-96 bg-gold/5 blur-3xl'}`} />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6"
          >
            <Zap className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">Fonctionnalités</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Tout ce dont vous avez <span className="text-gradient">besoin</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Une suite complète d'outils pour simplifier la réservation et la gestion 
            de votre activité coiffure.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} shouldReduceFx={shouldReduceFx} />
          ))}
        </div>

        {/* Barber Features Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6">
              <Users className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Pour les professionnels</span>
            </div>
            
            <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Développez votre <span className="text-gradient">activité</span>
            </h3>
            
            <p className="text-text-secondary mb-10">
              Coifly offre aux coiffeurs et salons une suite complète d'outils pour 
              gérer leur planning, leurs clients et augmenter leurs revenus.
            </p>
            
            <div className="space-y-6">
              {barberFeatures.map((feature, index) => (
                <BarberFeatureCard key={feature.title} feature={feature} index={index} />
              ))}
            </div>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow Effect */}
              {!shouldReduceFx && <div className="absolute -inset-10 bg-gold/10 rounded-full blur-3xl" />}
              
              {/* Dashboard Preview */}
              <div className="relative bg-dark-surface rounded-3xl border border-gold/20 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-text-muted text-sm">Bonjour,</div>
                    <div className="text-white font-bold text-lg">Ahmed</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <span className="text-gold font-bold">A</span>
                  </div>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { value: '5', label: 'Clients', color: 'bg-gold/20 text-gold' },
                    { value: '700', label: 'MAD', color: 'bg-green-500/20 text-green-400' },
                    { value: '2', label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-dark-surface-light rounded-xl p-3 text-center">
                      <div className={`text-xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</div>
                      <div className="text-text-muted text-xs">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                {/* Next Appointment */}
                <div className="bg-gradient-gold rounded-xl p-4 mb-4">
                  <div className="text-black/70 text-xs mb-1">Prochain RDV</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-black font-bold">Yassine</div>
                      <div className="text-black/70 text-sm">Dégradé · 10:00</div>
                    </div>
                    <div className="text-black font-bold">120 MAD</div>
                  </div>
                </div>
                
                {/* Today's Appointments */}
                <div className="text-white text-sm font-medium mb-3">Rendez-vous du jour</div>
                <div className="space-y-2">
                  {[
                    { time: '10:00', client: 'Yassine', service: 'Dégradé', status: 'pending' },
                    { time: '11:00', client: 'Karim', service: 'Barbe', status: 'confirmed' },
                    { time: '13:00', client: 'Hamza', service: 'Coupe', status: 'confirmed' },
                  ].map((apt, i) => (
                    <div key={i} className="flex items-center gap-3 bg-dark-surface-light rounded-lg p-3">
                      <div className="text-gold font-medium text-sm">{apt.time}</div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{apt.client}</div>
                        <div className="text-text-muted text-xs">{apt.service}</div>
                      </div>
                      <div className={`w-2 h-2 rounded-full ${
                        apt.status === 'confirmed' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Floating Badge */}
              {!shouldReduceFx && (
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-dark-surface rounded-xl p-3 border border-gold/30 shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-500">+</span>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Nouveau RDV</div>
                      <div className="text-text-muted text-xs">Salma · 16:00</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

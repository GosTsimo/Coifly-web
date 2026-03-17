import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Globe, 
  Zap,
  ArrowRight,
  Check,
  BarChart3,
  Users,
  MapPin,
  Scissors
} from 'lucide-react';

const metrics = [
  {
    value: '50K+',
    label: 'Utilisateurs actifs',
    growth: '+120%',
    icon: Users,
  },
  {
    value: '200K+',
    label: 'Réservations',
    growth: '+180%',
    icon: TrendingUp,
  },
  {
    value: '500+',
    label: 'Salons partenaires',
    growth: '+85%',
    icon: MapPin,
  },
  {
    value: '4.9',
    label: 'Note moyenne',
    growth: 'Top 1%',
    icon: Scissors,
  },
];

const milestones = [
  {
    year: '2024',
    title: 'Lancement',
    description: 'MVP au Maroc avec 50 salons partenaires',
    status: 'completed',
  },
  {
    year: '2025',
    title: 'Expansion',
    description: 'Scale national + 500 salons, lancement en Tunisie',
    status: 'current',
  },
  {
    year: '2026',
    title: 'International',
    description: 'Expansion en Afrique du Nord et Moyen-Orient',
    status: 'upcoming',
  },
  {
    year: '2027',
    title: 'Leader',
    description: 'Leader régional avec 1M+ utilisateurs',
    status: 'upcoming',
  },
];

const investmentHighlights = [
  'Marché de la beauté en Afrique : 15Mds$ d\'ici 2027',
  'Modèle SaaS + Commission avec unit economics positives',
  'Équipe fondatrice expérimentée (ex-Uber, ex-Jumia)',
  'Partenariats stratégiques avec les plus grands salons',
  'Technologie propriétaire et scalable',
  'Premier mover advantage dans la région MENA',
];

export default function ForInvestors() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="investors" className="relative py-32 bg-dark-surface overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-3xl" />
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
            <BarChart3 className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">Investisseurs</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Rejoignez l'aventure <span className="text-gradient">Coifly</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Nous construisons le futur de la coiffure en Afrique. 
            Une opportunité d'investissement unique dans un marché en pleine explosion.
          </motion.p>
        </div>

        {/* Metrics Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="relative group"
            >
              <div className="h-full bg-dark rounded-2xl p-6 border border-gold/10 hover:border-gold/30 transition-all duration-300 hover:shadow-card-hover">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <metric.icon className="w-6 h-6 text-gold" />
                </div>
                
                {/* Value */}
                <div className="text-4xl font-bold text-white mb-2">{metric.value}</div>
                
                {/* Label */}
                <div className="text-text-secondary text-sm mb-3">{metric.label}</div>
                
                {/* Growth Badge */}
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-full">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-green-400 text-xs font-medium">{metric.growth}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Roadmap */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-20"
        >
          <h3 className="text-2xl font-bold text-white text-center mb-10">
            Notre <span className="text-gradient">feuille de route</span>
          </h3>
          
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-gold/50 via-gold to-gold/50 hidden lg:block" />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="relative"
                >
                  {/* Year Badge */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 ${
                    milestone.status === 'completed' ? 'bg-gold' :
                    milestone.status === 'current' ? 'bg-gold animate-pulse' :
                    'bg-dark-surface border-2 border-gold/30'
                  }`}>
                    <span className={`text-lg font-bold ${
                      milestone.status === 'upcoming' ? 'text-gold' : 'text-black'
                    }`}>
                      {milestone.year}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-2">{milestone.title}</h4>
                    <p className="text-text-secondary text-sm">{milestone.description}</p>
                  </div>
                  
                  {/* Status Indicator */}
                  <div className={`mt-4 flex items-center justify-center gap-2 ${
                    milestone.status === 'completed' ? 'text-green-400' :
                    milestone.status === 'current' ? 'text-gold' :
                    'text-text-muted'
                  }`}>
                    {milestone.status === 'completed' && <Check className="w-4 h-4" />}
                    {milestone.status === 'current' && <Zap className="w-4 h-4" />}
                    {milestone.status === 'upcoming' && <Target className="w-4 h-4" />}
                    <span className="text-xs font-medium uppercase">
                      {milestone.status === 'completed' ? 'Réalisé' :
                       milestone.status === 'current' ? 'En cours' : 'À venir'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Investment Highlights */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">
              Pourquoi investir dans <span className="text-gradient">Coifly ?</span>
            </h3>
            
            <p className="text-text-secondary mb-8">
              Le marché de la beauté et du bien-être en Afrique connaît une croissance 
              explosive. Coifly se positionne comme le leader technologique de ce secteur 
              en pleine transformation.
            </p>

            <div className="space-y-4 mb-10">
              {investmentHighlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 1.1 + index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <span className="text-text-secondary">{highlight}</span>
                </motion.div>
              ))}
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-black font-bold rounded-xl hover:shadow-gold-lg transition-all duration-300 hover:-translate-y-1 group"
            >
              Discuter d'un investissement
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* Right - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-10 bg-gold/10 rounded-full blur-3xl" />
              
              {/* Market Size Card */}
              <div className="relative bg-dark rounded-3xl border border-gold/20 p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <Globe className="w-6 h-6 text-gold" />
                  <span className="text-white font-bold">Marché addressable</span>
                </div>
                
                <div className="space-y-6">
                  {/* TAM */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary text-sm">TAM (Total)</span>
                      <span className="text-white font-bold">15 Md$</span>
                    </div>
                    <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: '100%' } : {}}
                        transition={{ duration: 1.5, delay: 1.5 }}
                        className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full"
                      />
                    </div>
                    <span className="text-text-muted text-xs">Marché beauté Afrique 2027</span>
                  </div>
                  
                  {/* SAM */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary text-sm">SAM (Serviceable)</span>
                      <span className="text-white font-bold">3.5 Md$</span>
                    </div>
                    <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: '60%' } : {}}
                        transition={{ duration: 1.5, delay: 1.7 }}
                        className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full"
                      />
                    </div>
                    <span className="text-text-muted text-xs">Coiffure & soins MENA</span>
                  </div>
                  
                  {/* SOM */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary text-sm">SOM (Obtainable)</span>
                      <span className="text-white font-bold">150 M$</span>
                    </div>
                    <div className="h-3 bg-dark-surface rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={isInView ? { width: '25%' } : {}}
                        transition={{ duration: 1.5, delay: 1.9 }}
                        className="h-full bg-gradient-to-r from-gold/50 to-gold rounded-full"
                      />
                    </div>
                    <span className="text-text-muted text-xs">Objectif Coifly 2027</span>
                  </div>
                </div>

                {/* Revenue Model */}
                <div className="mt-8 pt-6 border-t border-gold/10">
                  <div className="text-white font-medium mb-4">Modèle de revenus</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-surface rounded-xl p-4">
                      <div className="text-gold font-bold text-xl mb-1">8%</div>
                      <div className="text-text-muted text-xs">Commission par réservation</div>
                    </div>
                    <div className="bg-dark-surface rounded-xl p-4">
                      <div className="text-gold font-bold text-xl mb-1">99 MAD</div>
                      <div className="text-text-muted text-xs">Abonnement mensuel Pro</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

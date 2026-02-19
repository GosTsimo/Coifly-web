import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  Check,
  TrendingUp,
  Calendar,
  Scissors,
  Clock,
  Star,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Gestion du staff',
    description: 'Gérez les planniers de vos coiffeurs, leurs services et leurs performances.',
  },
  {
    icon: BarChart3,
    title: 'Analytics avancés',
    description: 'Tableaux de bord détaillés pour suivre vos revenus, clients et tendances.',
  },
  {
    icon: Calendar,
    title: 'Réservations centralisées',
    description: 'Toutes les réservations en un seul endroit avec synchronisation temps réel.',
  },
  {
    icon: Settings,
    title: 'Paramètres flexibles',
    description: 'Configurez vos horaires, services, tarifs et politiques d\'annulation.',
  },
];

const dashboardMetrics = [
  { label: 'RDV aujourd\'hui', value: '12', icon: Calendar, color: 'text-gold' },
  { label: 'Revenus', value: '2,450', icon: TrendingUp, color: 'text-green-400' },
  { label: 'En attente', value: '3', icon: Clock, color: 'text-yellow-400' },
  { label: 'Note moyenne', value: '4.8', icon: Star, color: 'text-purple-400' },
];

const staffMembers = [
  { name: 'Karim', role: 'Barbier', clients: 24, rating: 4.9, status: 'available' },
  { name: 'Youssef', role: 'Coiffeur', clients: 18, rating: 4.7, status: 'busy' },
  { name: 'Mehdi', role: 'Styliste homme', clients: 21, rating: 4.8, status: 'available' },
];

export default function ForSalons() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="salons" className="relative py-32 bg-dark overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl" />
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
            <Building2 className="w-4 h-4 text-gold" />
            <span className="text-gold text-sm font-medium">Pour les salons</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Gérez votre salon <span className="text-gradient">comme un pro</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-text-secondary max-w-2xl mx-auto"
          >
            Une solution complète pour les salons de coiffure. Gérez votre équipe, 
            vos réservations et votre croissance depuis une seule plateforme.
          </motion.p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Features */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="group"
                >
                  <div className="h-full bg-dark-surface rounded-2xl p-6 border border-gold/10 hover:border-gold/30 transition-all duration-300 hover:shadow-card-hover">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-gold" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gold transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-text-secondary text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              {[
                { icon: Shield, text: 'Sécurisé' },
                { icon: Check, text: 'Sans engagement' },
                { icon: TrendingUp, text: 'ROI garanti' },
              ].map((badge) => (
                <div 
                  key={badge.text}
                  className="flex items-center gap-2 px-4 py-2 bg-dark-surface rounded-full border border-gold/20"
                >
                  <badge.icon className="w-4 h-4 text-gold" />
                  <span className="text-white text-sm">{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right - Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative"
          >
            <div className="relative">
              {/* Glow */}
              <div className="absolute -inset-10 bg-gold/10 rounded-full blur-3xl" />
              
              {/* Dashboard */}
              <div className="relative bg-dark-surface rounded-3xl border border-gold/20 overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-dark-surface-light p-4 border-b border-gold/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <div className="text-white font-bold">Barber Club</div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-green-500 text-xs">Ouvert · 09:00 - 19:00</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-gold" />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {dashboardMetrics.map((metric, i) => (
                      <div key={i} className="bg-dark rounded-xl p-3 text-center">
                        <metric.icon className={`w-4 h-4 ${metric.color} mx-auto mb-1`} />
                        <div className="text-white font-bold text-sm">{metric.value}</div>
                        <div className="text-text-muted text-[10px]">{metric.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Next Appointment */}
                  <div className="bg-gradient-gold rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-black/70 text-sm font-medium">Prochain RDV</span>
                      <span className="text-black font-bold">150 MAD</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                        <span className="text-black font-bold">A</span>
                      </div>
                      <div>
                        <div className="text-black font-bold">Adam</div>
                        <div className="text-black/70 text-sm">Coupe + Barbe · 10:00 · Karim</div>
                      </div>
                    </div>
                  </div>

                  {/* Staff Section */}
                  <div className="mb-3">
                    <div className="text-white text-sm font-medium mb-3">Mon équipe</div>
                    <div className="space-y-2">
                      {staffMembers.map((staff, i) => (
                        <div key={i} className="flex items-center gap-3 bg-dark rounded-lg p-3">
                          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                            <span className="text-gold font-bold">{staff.name[0]}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-sm font-medium">{staff.name}</span>
                              <span className="text-text-muted text-xs">{staff.role}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-text-muted" />
                                <span className="text-text-muted text-xs">{staff.clients}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-gold fill-gold" />
                                <span className="text-text-muted text-xs">{staff.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            staff.status === 'available' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { icon: Plus, label: 'Créneau' },
                      { icon: Scissors, label: 'Services' },
                      { icon: Clock, label: 'Horaires' },
                      { icon: Calendar, label: 'Planning' },
                    ].map((action, i) => (
                      <div key={i} className="bg-dark rounded-lg p-2 text-center">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mx-auto mb-1">
                          <action.icon className="w-4 h-4 text-gold" />
                        </div>
                        <span className="text-text-muted text-[10px]">{action.label}</span>
                      </div>
                    ))}
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

// Plus icon component
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

// Bell icon component
function Bell({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

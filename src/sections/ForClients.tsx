import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  CreditCard, 
  Star, 
  Check,
  Heart,
  MapPin
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Recherchez',
    description: 'Trouvez le salon ou coiffeur parfait près de chez vous avec filtres avancés.',
    color: 'bg-blue-500/20 text-blue-400',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Réservez',
    description: 'Choisissez votre service et votre créneau horaire en quelques clics.',
    color: 'bg-gold/20 text-gold',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Payez',
    description: 'Payez en toute sécurité directement dans l\'application.',
    color: 'bg-green-500/20 text-green-400',
  },
  {
    number: '04',
    icon: Star,
    title: 'Profitez',
    description: 'Vivez l\'expérience et partagez votre avis avec la communauté.',
    color: 'bg-purple-500/20 text-purple-400',
  },
];

const benefits = [
  'Réservation gratuite et instantanée',
  'Annulation flexible jusqu\'à 2h avant',
  'Paiement sécurisé intégré',
  'Avis vérifiés de la communauté',
  'Programme de fidélité exclusif',
  'Notifications de rappel automatiques',
];

export default function ForClients() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section id="clients" className="relative py-32 bg-dark overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div ref={sectionRef} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 rounded-full border border-gold/20 mb-6">
              <Heart className="w-4 h-4 text-gold" />
              <span className="text-gold text-sm font-medium">Pour les clients</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Votre coiffeur, <span className="text-gradient">à portée de main</span>
            </h2>
            
            <p className="text-lg text-text-secondary mb-8">
              Fini les appels interminables et les files d'attente. Avec Coifly, 
              réservez votre coiffeur préféré en quelques secondes, où que vous soyez.
            </p>

            {/* Benefits List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-gold" />
                  </div>
                  <span className="text-text-secondary text-sm">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-[280px]">
              {/* Glow */}
              <div className="absolute -inset-10 bg-gold/10 rounded-full blur-3xl" />
              
              {/* Phone */}
              <div className="relative bg-dark-surface rounded-[2.5rem] border-4 border-gold/30 overflow-hidden shadow-2xl">
                {/* Search Screen */}
                <div className="p-4 pt-8">
                  {/* Search Bar */}
                  <div className="bg-dark-surface-light rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
                    <Search className="w-5 h-5 text-text-muted" />
                    <span className="text-text-muted text-sm">Rechercher un salon...</span>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {['Tous', 'Ouvert', 'Note', 'Prix'].map((filter, i) => (
                      <div 
                        key={filter}
                        className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                          i === 0 
                            ? 'bg-gold text-black font-medium' 
                            : 'bg-dark-surface-light text-text-secondary'
                        }`}
                      >
                        {filter}
                      </div>
                    ))}
                  </div>
                  
                  {/* Salon Cards */}
                  <div className="space-y-3">
                    {[
                      { 
                        name: 'Beauty Luxe', 
                        rating: 4.8, 
                        distance: '1.2 km',
                        price: 'À partir de 80 MAD',
                        open: true 
                      },
                      { 
                        name: 'Nadia Hair', 
                        rating: 4.6, 
                        distance: '2.5 km',
                        price: 'À partir de 60 MAD',
                        open: true 
                      },
                      { 
                        name: 'Prestige Barber', 
                        rating: 4.9, 
                        distance: '0.8 km',
                        price: 'À partir de 100 MAD',
                        open: false 
                      },
                    ].map((salon, i) => (
                      <div key={i} className="bg-dark-surface-light rounded-xl p-3">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gold/30 to-gold/10 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="text-white font-medium text-sm">{salon.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <Star className="w-3 h-3 text-gold fill-gold" />
                                  <span className="text-text-secondary text-xs">{salon.rating}</span>
                                  <span className="text-text-muted text-xs">·</span>
                                  <MapPin className="w-3 h-3 text-text-muted" />
                                  <span className="text-text-secondary text-xs">{salon.distance}</span>
                                </div>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${salon.open ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>
                            <div className="text-gold text-xs mt-2">{salon.price}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-8 bg-dark-surface rounded-xl p-3 border border-gold/20 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-white text-sm font-medium">4.9</span>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-8 bg-dark-surface rounded-xl p-3 border border-green-500/20 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-white text-sm">Ouvert maintenant</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/30 to-transparent hidden lg:block" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.15 }}
                className="relative"
              >
                <div className="text-center">
                  {/* Number Badge */}
                  <div className="relative inline-flex mb-6">
                    <div className={`w-16 h-16 rounded-2xl ${step.color.split(' ')[0]} flex items-center justify-center`}>
                      <step.icon className={`w-7 h-7 ${step.color.split(' ')[1]}`} />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                      <span className="text-black text-xs font-bold">{step.number}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

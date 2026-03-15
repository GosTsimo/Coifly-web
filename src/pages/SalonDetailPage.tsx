import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Heart,
  Share2,
  ChevronRight,
  Scissors,
  Calendar,
  ExternalLink,
} from 'lucide-react';

// ─── Mock data (replace with real API call using `slug`) ──────────────────────

const MOCK_SALON = {
  slug: 'testtt',
  name: 'Barbearia Luxe',
  rating: 4.7,
  reviewCount: 128,
  distance: '1.2 km',
  address: '12 Rue Al Hansali, Casablanca 20250',
  phone: '+212 6 12 34 56 78',
  isOpen: true,
  todayHours: '09:00 – 20:00',
  coordinates: { lat: 33.5731, lng: -7.5898 },
  images: [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&q=80',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=800&q=80',
  ],
  services: [
    { id: 1, name: 'Coupe homme', duration: 30, price: 80, icon: '✂️' },
    { id: 2, name: 'Barbe & rasage', duration: 20, price: 50, icon: '🪒' },
    { id: 3, name: 'Coupe + Barbe', duration: 45, price: 120, icon: '💈' },
    { id: 4, name: 'Soin du cuir chevelu', duration: 30, price: 90, icon: '🌿' },
    { id: 5, name: 'Coloration', duration: 60, price: 180, icon: '🎨' },
  ],
  staff: [
    { id: 1, name: 'Karim M.', specialty: 'Barbier senior', rating: 4.9, avatar: 'K' },
    { id: 2, name: 'Youssef A.', specialty: 'Coiffeur styliste', rating: 4.8, avatar: 'Y' },
    { id: 3, name: 'Mehdi R.', specialty: 'Spécialiste barbe', rating: 4.7, avatar: 'M' },
    { id: 4, name: 'Amine S.', specialty: 'Coloriste', rating: 4.6, avatar: 'A' },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1593702288056-7cc0d9632e2c?w=400&q=80',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&q=80',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400&q=80',
    'https://images.unsplash.com/photo-1593702288056-7cc0d9632e2c?w=400&q=80',
    'https://images.unsplash.com/photo-1560066984-138daaa14948?w=400&q=80',
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&q=80',
  ],
  reviews: [
    {
      id: 1,
      name: 'Mohammed K.',
      date: '10 mars 2026',
      rating: 5,
      comment: 'Excellent service, coupe parfaite et accueil très chaleureux. Je recommande vivement !',
    },
    {
      id: 2,
      name: 'Hamza B.',
      date: '5 mars 2026',
      rating: 4,
      comment: 'Très bon salon, Karim fait du très bon travail sur la barbe. Propre et professionnel.',
    },
    {
      id: 3,
      name: 'Saad L.',
      date: '28 fév. 2026',
      rating: 5,
      comment: 'Meilleur salon de Casablanca ! Je viens toujours ici pour ma coupe mensuelle.',
    },
  ],
  schedule: [
    { day: 'Lundi', hours: '09:00 – 20:00', isToday: false },
    { day: 'Mardi', hours: '09:00 – 20:00', isToday: false },
    { day: 'Mercredi', hours: '09:00 – 20:00', isToday: false },
    { day: 'Jeudi', hours: '09:00 – 20:00', isToday: false },
    { day: 'Vendredi', hours: '09:00 – 21:00', isToday: false },
    { day: 'Samedi', hours: '10:00 – 22:00', isToday: true },
    { day: 'Dimanche', hours: 'Fermé', isToday: false },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const starSize = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${starSize} ${i <= Math.round(rating) ? 'fill-gold text-gold' : 'text-dark-elevated'}`}
        />
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-text-primary mb-5 flex items-center gap-2">
      {children}
    </h2>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SalonDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // In production replace with: const salon = useSalonBySlug(slug)
  const salon = MOCK_SALON;

  if (!salon) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4">
        <p className="text-text-secondary text-lg">Salon introuvable : <span className="text-gold">{slug}</span></p>
        <Link to="/" className="text-gold underline underline-offset-4 hover:text-gold-light transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${salon.coordinates.lat},${salon.coordinates.lng}`;

  return (
    <div className="min-h-screen bg-dark text-white">
      {/* ── Hero Image Carousel ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <motion.img
          key={activeImage}
          src={salon.images[activeImage]}
          alt={salon.name}
          className="w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />

        {/* Top bar actions */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 sm:pt-6">
          <Link
            to="/"
            className="w-10 h-10 rounded-full bg-dark/70 backdrop-blur-sm flex items-center justify-center hover:bg-dark/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex gap-3">
            <button
              onClick={() => navigator.share?.({ title: salon.name, url: window.location.href })}
              className="w-10 h-10 rounded-full bg-dark/70 backdrop-blur-sm flex items-center justify-center hover:bg-dark/90 transition-colors"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => setIsFavorite((f) => !f)}
              className="w-10 h-10 rounded-full bg-dark/70 backdrop-blur-sm flex items-center justify-center hover:bg-dark/90 transition-colors"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
              />
            </button>
          </div>
        </div>

        {/* Thumbnail dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {salon.images.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`rounded-full transition-all ${
                i === activeImage ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-4 pb-32">

        {/* ── Quick Info Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-dark-surface rounded-2xl p-5 -mt-8 relative z-10 shadow-xl border border-white/5 mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-2xl font-bold text-text-primary leading-tight">{salon.name}</h1>
            <span
              className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full mt-1 ${
                salon.isOpen
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-error/10 text-error border border-error/20'
              }`}
            >
              {salon.isOpen ? 'Ouvert' : 'Fermé'}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={salon.rating} />
            <span className="text-gold font-semibold text-sm">{salon.rating}</span>
            <span className="text-text-muted text-sm">({salon.reviewCount} avis)</span>
            <span className="text-text-muted text-sm ml-auto flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" />
              {salon.distance}
            </span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-2 text-text-secondary text-sm mb-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
            <span>{salon.address}</span>
          </div>

          {/* Hours today */}
          <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
            <Clock className="w-4 h-4 shrink-0 text-gold" />
            <span>{salon.todayHours}</span>
          </div>

          {/* Phone */}
          <a
            href={`tel:${salon.phone}`}
            className="flex items-center gap-3 bg-dark-surface-light rounded-xl px-4 py-3 hover:bg-dark-elevated transition-colors group"
          >
            <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
              <Phone className="w-4 h-4 text-gold" />
            </div>
            <span className="text-text-primary font-medium">{salon.phone}</span>
            <ChevronRight className="w-4 h-4 text-text-muted ml-auto" />
          </a>
        </motion.div>

        {/* ── Services ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-8"
        >
          <SectionTitle>
            <Scissors className="w-5 h-5 text-gold" />
            Services
          </SectionTitle>
          <div className="flex flex-col gap-3">
            {salon.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center gap-4 bg-dark-surface rounded-xl px-4 py-4 border border-white/5 hover:border-gold/20 transition-colors"
              >
                <span className="text-2xl">{service.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium">{service.name}</p>
                  <p className="text-text-muted text-sm">{service.duration} min</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gold font-bold">{service.price} MAD</span>
                  <button className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-dark font-bold text-lg hover:bg-gold-light transition-colors">
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Notre équipe ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8"
        >
          <SectionTitle>
            <span className="text-gold">👥</span>
            Notre équipe
          </SectionTitle>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {salon.staff.map((member) => (
              <div
                key={member.id}
                className="shrink-0 w-32 bg-dark-surface rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2 text-center"
              >
                <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold">
                  {member.avatar}
                </div>
                <p className="text-text-primary font-semibold text-sm leading-tight">{member.name}</p>
                <p className="text-text-muted text-xs leading-tight">{member.specialty}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-gold text-gold" />
                  <span className="text-gold text-xs font-medium">{member.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Galerie ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mb-8"
        >
          <SectionTitle>
            <span className="text-gold">🖼️</span>
            Galerie
          </SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            {salon.gallery.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img
                  src={img}
                  alt={`Galerie ${i + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Avis clients ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-8"
        >
          <SectionTitle>
            <Star className="w-5 h-5 text-gold" />
            Avis clients
          </SectionTitle>

          {/* Average rating banner */}
          <div className="flex items-center gap-5 bg-dark-surface rounded-2xl p-5 border border-white/5 mb-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-gold">{salon.rating}</p>
              <StarRating rating={salon.rating} size="lg" />
              <p className="text-text-muted text-xs mt-1">{salon.reviewCount} avis</p>
            </div>
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = star === 5 ? 80 : star === 4 ? 30 : star === 3 ? 10 : star === 2 ? 5 : 3;
                const pct = Math.round((count / salon.reviewCount) * 100);
                return (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-text-muted w-2">{star}</span>
                    <Star className="w-3 h-3 fill-gold text-gold" />
                    <div className="flex-1 h-1.5 bg-dark-elevated rounded-full overflow-hidden">
                      <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-text-muted w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual reviews */}
          <div className="flex flex-col gap-4">
            {salon.reviews.map((review) => (
              <div key={review.id} className="bg-dark-surface rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold">
                    {review.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-text-primary font-medium text-sm">{review.name}</p>
                    <p className="text-text-muted text-xs">{review.date}</p>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Horaires ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="mb-8"
        >
          <SectionTitle>
            <Clock className="w-5 h-5 text-gold" />
            Horaires
          </SectionTitle>
          <div className="bg-dark-surface rounded-2xl border border-white/5 overflow-hidden">
            {salon.schedule.map((item, i) => (
              <div
                key={item.day}
                className={`flex items-center justify-between px-5 py-3.5 ${
                  i < salon.schedule.length - 1 ? 'border-b border-white/5' : ''
                } ${item.isToday ? 'bg-gold/5' : ''}`}
              >
                <span
                  className={`text-sm font-medium ${
                    item.isToday ? 'text-gold' : 'text-text-secondary'
                  }`}
                >
                  {item.day}
                  {item.isToday && (
                    <span className="ml-2 text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
                      Aujourd'hui
                    </span>
                  )}
                </span>
                <span
                  className={`text-sm ${
                    item.hours === 'Fermé' ? 'text-error' : item.isToday ? 'text-gold font-semibold' : 'text-text-primary'
                  }`}
                >
                  {item.hours}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Localisation ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <SectionTitle>
            <MapPin className="w-5 h-5 text-gold" />
            Localisation
          </SectionTitle>
          <div className="bg-dark-surface rounded-2xl p-5 border border-white/5">
            <p className="text-text-secondary text-sm mb-4 flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
              {salon.address}
            </p>
            {/* Static map placeholder */}
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-dark-elevated mb-4">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${salon.coordinates.lat},${salon.coordinates.lng}&zoom=15&size=600x180&maptype=roadmap&markers=color:blue%7C${salon.coordinates.lat},${salon.coordinates.lng}&key=YOUR_API_KEY`}
                alt="Carte"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if no API key
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-dark-elevated">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <p className="text-text-muted text-xs">Carte interactive</p>
              </div>
            </div>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gold/10 border border-gold/20 text-gold text-sm font-medium hover:bg-gold/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ouvrir dans Google Maps
            </a>
          </div>
        </motion.div>
      </div>

      {/* ── Sticky CTA Button ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-dark via-dark/95 to-transparent">
        <motion.button
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-2xl mx-auto flex items-center justify-center gap-3 py-4 rounded-2xl bg-gold hover:bg-gold-light active:bg-gold-dark text-dark font-bold text-base transition-colors shadow-lg shadow-gold/20"
        >
          <Calendar className="w-5 h-5" />
          Réserver maintenant
        </motion.button>
      </div>
    </div>
  );
}

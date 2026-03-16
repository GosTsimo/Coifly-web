import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  Loader2,
} from 'lucide-react';
import { isAuthenticated } from '../services/authService';

// ─── API Types ────────────────────────────────────────────────────────────────

interface ApiSalon {
  id: number;
  name: string;
  description: string | null;
  rating: number;
  reviews_count: number;
  distance: string | null;
  address: string;
  phone: string;
  email: string | null;
  website: string | null;
  is_open: boolean;
  open_today: string | null;
  is_favorite: boolean;
  latitude: number;
  longitude: number;
  images: (string | null)[];
  amenities: { id: number; name: string; icon: string }[];
  schedule: {
    day: string;
    hours_start: string;
    hours_end: string;
    is_closed: boolean;
  }[];
  slug: string;
}

interface ApiService {
  id: number;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  icon: string;
  category: string;
}

interface ApiBarber {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews_count: number;
  photo: string | null;
  experience: string;
  is_available: boolean;
}

interface ApiReview {
  id: number;
  user: { id: number; name: string; photo: string | null };
  rating: number;
  comment: string;
  date: string;
  helpful_count: number;
}

interface ApiData {
  salon: ApiSalon;
  services: ApiService[];
  barbers: ApiBarber[];
  reviews: ApiReview[];
  gallery: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API_BASE = 'https://beautybooking-f05a760bafaf.herokuapp.com/api';

const JS_DAY_TO_FRENCH = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

const SERVICE_ICON_MAP: Record<string, string> = {
  'content-cut': '✂️',
  'spa': '🌿',
  'face': '💆',
  'color-lens': '🎨',
  'hot-tub': '🧖',
  'self-improvement': '🧘',
  'brush': '🖌️',
};

function serviceEmoji(icon: string): string {
  return SERVICE_ICON_MAP[icon] ?? '✂️';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

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
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/salon/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Salon introuvable (${res.status})`);
        return res.json();
      })
      .then((json) => {
        if (!json.success) throw new Error('Réponse API invalide');
        setData(json.data as ApiData);
        setIsFavorite(json.data.salon.is_favorite ?? false);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-text-secondary text-lg text-center">
          {error ?? 'Salon introuvable'} : <span className="text-gold">{slug}</span>
        </p>
        <Link to="/" className="text-gold underline underline-offset-4 hover:text-gold-light transition-colors">
          ← Retour à l'accueil
        </Link>
      </div>
    );
  }

  const { salon, services, barbers, reviews, gallery } = data;
  const images = salon.images.filter((img): img is string => !!img);
  const hasImages = images.length > 0;
  const todayFrench = JS_DAY_TO_FRENCH[new Date().getDay()];
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${salon.latitude},${salon.longitude}`;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="min-h-screen bg-dark text-white">

      {/* ── Hero Image Carousel ── */}
      <div className="relative h-72 sm:h-96 overflow-hidden bg-dark-surface">
        {hasImages ? (
          <motion.img
            key={activeImage}
            src={images[activeImage]}
            alt={salon.name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-dark-surface">
            <Scissors className="w-16 h-16 text-gold/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/30 to-transparent" />

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
              <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
            </button>
          </div>
        </div>

        {hasImages && images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`rounded-full transition-all ${i === activeImage ? 'w-6 h-2 bg-gold' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}
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
            <div>
              <h1 className="text-2xl font-bold text-text-primary leading-tight">{salon.name}</h1>
              {salon.description && <p className="text-text-muted text-sm mt-1">{salon.description}</p>}
            </div>
            <span className={`shrink-0 text-xs font-semibold px-3 py-1 rounded-full mt-1 ${salon.is_open ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
              {salon.is_open ? 'Ouvert' : 'Fermé'}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={salon.rating} />
            <span className="text-gold font-semibold text-sm">{salon.rating > 0 ? salon.rating : '—'}</span>
            <span className="text-text-muted text-sm">({salon.reviews_count} avis)</span>
            {salon.distance && (
              <span className="text-text-muted text-sm ml-auto flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5" />{salon.distance}
              </span>
            )}
          </div>

          <div className="flex items-start gap-2 text-text-secondary text-sm mb-2">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gold" />
            <span>{salon.address}</span>
          </div>

          {salon.open_today && (
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-4">
              <Clock className="w-4 h-4 shrink-0 text-gold" />
              <span>{salon.open_today}</span>
            </div>
          )}

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

          {salon.amenities.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {salon.amenities.map((a) => (
                <span key={a.id} className="text-xs px-3 py-1 rounded-full bg-dark-elevated text-text-secondary border border-white/5">
                  {a.name}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Services ── */}
        {services.length > 0 && (
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
              {services.map((service) => (
                <div key={service.id} className="flex items-center gap-4 bg-dark-surface rounded-xl px-4 py-4 border border-white/5 hover:border-gold/20 transition-colors">
                  <span className="text-2xl">{serviceEmoji(service.icon)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium">{service.name}</p>
                    <p className="text-text-muted text-sm">{service.duration} min</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gold font-bold">{service.price} MAD</span>
                    <button className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-dark font-bold text-lg hover:bg-gold-light transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Notre équipe ── */}
        {barbers.length > 0 && (
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
              {barbers.map((barber) => (
                <div key={barber.id} className="shrink-0 w-32 bg-dark-surface rounded-2xl p-4 border border-white/5 flex flex-col items-center gap-2 text-center">
                  {barber.photo ? (
                    <img src={barber.photo} alt={barber.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold/20" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center text-2xl font-bold text-gold">
                      {barber.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-text-primary font-semibold text-sm leading-tight">{barber.name}</p>
                  <p className="text-text-muted text-xs leading-tight">{barber.specialty}</p>
                  <p className="text-text-muted text-xs">{barber.experience}</p>
                  {barber.rating > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-gold text-gold" />
                      <span className="text-gold text-xs font-medium">{barber.rating}</span>
                    </div>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${barber.is_available ? 'bg-success/10 text-success' : 'bg-dark-elevated text-text-muted'}`}>
                    {barber.is_available ? 'Disponible' : 'Occupé'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Galerie ── */}
        {gallery.length > 0 && (
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
              {gallery.map((img, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden">
                  <img src={img} alt={`Galerie ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
          <div className="flex items-center gap-5 bg-dark-surface rounded-2xl p-5 border border-white/5 mb-4">
            <div className="text-center">
              <p className="text-5xl font-bold text-gold">{salon.rating > 0 ? salon.rating : '—'}</p>
              <StarRating rating={salon.rating} size="lg" />
              <p className="text-text-muted text-xs mt-1">{salon.reviews_count} avis</p>
            </div>
            <div className="flex-1 space-y-2">
              {ratingCounts.map(({ star, count }) => {
                const pct = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
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
          {reviews.length > 0 ? (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-dark-surface rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    {review.user.photo ? (
                      <img src={review.user.photo} alt={review.user.name} className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-sm font-bold text-gold">
                        {review.user.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-text-primary font-medium text-sm">{review.user.name}</p>
                      <p className="text-text-muted text-xs">{formatDate(review.date)}</p>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-text-secondary text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-muted text-sm text-center py-6">Aucun avis pour le moment.</p>
          )}
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
            {salon.schedule.map((item, i) => {
              const isToday = item.day === todayFrench;
              const hoursLabel = item.is_closed ? 'Fermé' : `${item.hours_start} – ${item.hours_end}`;
              return (
                <div
                  key={item.day}
                  className={`flex items-center justify-between px-5 py-3.5 ${i < salon.schedule.length - 1 ? 'border-b border-white/5' : ''} ${isToday ? 'bg-gold/5' : ''}`}
                >
                  <span className={`text-sm font-medium ${isToday ? 'text-gold' : 'text-text-secondary'}`}>
                    {item.day}
                    {isToday && (
                      <span className="ml-2 text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full border border-gold/20">
                        Aujourd'hui
                      </span>
                    )}
                  </span>
                  <span className={`text-sm ${item.is_closed ? 'text-error' : isToday ? 'text-gold font-semibold' : 'text-text-primary'}`}>
                    {hoursLabel}
                  </span>
                </div>
              );
            })}
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
            <div className="w-full h-40 rounded-xl overflow-hidden bg-dark-elevated flex flex-col items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-gold" />
              </div>
              <p className="text-text-muted text-xs">{salon.latitude.toFixed(5)}, {salon.longitude.toFixed(5)}</p>
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

      {/* ── Sticky CTA ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4 bg-gradient-to-t from-dark via-dark/95 to-transparent">
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <button
            type="button"
            onClick={() => {
              const bookingPath = `/salon/${slug}/booking`;
              const bookingState = { salonId: salon.id, salonName: salon.name };
              if (isAuthenticated()) {
                navigate(bookingPath, { state: bookingState });
                return;
              }
              navigate('/login', {
                state: {
                  redirectTo: bookingPath,
                  bookingState,
                },
              });
            }}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gold hover:bg-gold-light active:bg-gold-dark text-dark font-bold text-base transition-colors shadow-lg shadow-gold/20"
          >
            <Calendar className="w-5 h-5" />
            Réserver maintenant
          </button>
        </motion.div>
      </div>
    </div>
  );
}

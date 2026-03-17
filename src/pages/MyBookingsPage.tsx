import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar,
  CalendarClock,
  ChevronLeft,
  Clock3,
  History,
  Loader2,
  MessageSquare,
  RotateCcw,
  Star,
  X,
} from 'lucide-react';
import { getStoredToken, isAuthenticated } from '../services/authService';

type BookingStatus = 'pending' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
type ActiveTab = 'upcoming' | 'pending' | 'history';

type ApiBooking = {
  id: number;
  salon_name?: string;
  service_name?: string;
  barber_name?: string;
  date?: string;
  time?: string;
  price?: number;
  status?: string;
  salon_image?: string;
  salon_address?: string;
  has_review?: boolean;
};

type BookingItem = {
  id: number;
  salon: string;
  service: string;
  barber: string;
  dateRaw: string;
  dateLabel: string;
  time: string;
  price: number;
  status: BookingStatus;
  image: string;
  address: string;
  hasReview: boolean;
};

const API_BASE = import.meta.env.VITE_API_BASE || '/api';
const EMPTY_IMAGE = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=1200&auto=format&fit=crop';

function authHeaders() {
  const token = getStoredToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function normalizeStatus(status: string | undefined): BookingStatus {
  if (status === 'completed') return 'done';
  if (status === 'canceled') return 'cancelled';
  if (status === 'pending') return 'pending';
  if (status === 'confirmed') return 'confirmed';
  if (status === 'done') return 'done';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'no_show') return 'no_show';
  return 'pending';
}

function formatDateFr(date: string | undefined): string {
  if (!date) return 'Date a confirmer';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function mapApiBookingToUI(item: ApiBooking): BookingItem {
  return {
    id: Number(item.id),
    salon: item.salon_name || 'Salon',
    service: item.service_name || 'Service',
    barber: item.barber_name || 'Coiffeur',
    dateRaw: item.date || '',
    dateLabel: formatDateFr(item.date),
    time: item.time || '--:--',
    price: Number(item.price || 0),
    status: normalizeStatus(item.status),
    image: item.salon_image || EMPTY_IMAGE,
    address: item.salon_address || 'Adresse non disponible',
    hasReview: Boolean(item.has_review),
  };
}

async function getClientBookings(): Promise<BookingItem[]> {
  const response = await fetch(`${API_BASE}/bookings`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Erreur chargement bookings (${response.status})`);
  }

  const body = await response.json().catch(() => null);
  const data = body?.data || body;
  const bookings = Array.isArray(data?.bookings)
    ? data.bookings
    : Array.isArray(data)
      ? data
      : [];

  return bookings.map((booking: ApiBooking) => mapApiBookingToUI(booking));
}

async function cancelBooking(bookingId: number, reason?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(reason ? { reason } : {}),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Impossible d\'annuler ce rendez-vous');
  }
}

async function submitBookingReview(bookingId: number, rating: number, comment: string): Promise<void> {
  const response = await fetch(`${API_BASE}/bookings/${bookingId}/review`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      rating,
      booking_id: bookingId,
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || 'Impossible d\'envoyer votre avis');
  }
}

function statusBadge(status: BookingStatus) {
  if (status === 'confirmed') {
    return 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-300';
  }
  if (status === 'pending') {
    return 'bg-amber-500/20 border border-amber-400/30 text-amber-300';
  }
  if (status === 'done') {
    return 'bg-blue-500/20 border border-blue-400/30 text-blue-300';
  }
  if (status === 'no_show') {
    return 'bg-red-500/20 border border-red-400/30 text-red-300';
  }
  return 'bg-zinc-500/20 border border-zinc-400/30 text-zinc-300';
}

function statusLabel(status: BookingStatus) {
  if (status === 'confirmed') return 'A venir';
  if (status === 'pending') return 'En attente';
  if (status === 'done') return 'Termine';
  if (status === 'no_show') return 'Non confirme';
  return 'Annule';
}

export default function MyBookingsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ActiveTab>('upcoming');
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reviewTarget, setReviewTarget] = useState<BookingItem | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  async function loadData(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const items = await getClientBookings();
      setBookings(items);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur de chargement';
      setError(message);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { redirectTo: '/client/bookings' }, replace: true });
      return;
    }

    void loadData();
  }, [navigate]);

  const upcomingItems = useMemo(() => bookings.filter((b) => b.status === 'confirmed'), [bookings]);
  const pendingItems = useMemo(() => bookings.filter((b) => b.status === 'pending'), [bookings]);
  const historyItems = useMemo(() => bookings.filter((b) => b.status === 'done' || b.status === 'cancelled' || b.status === 'no_show'), [bookings]);

  const filteredItems = useMemo(() => {
    if (activeTab === 'upcoming') return upcomingItems;
    if (activeTab === 'pending') return pendingItems;
    return historyItems;
  }, [activeTab, historyItems, pendingItems, upcomingItems]);

  async function handleCancel(item: BookingItem) {
    if (actionLoadingId) return;
    setActionLoadingId(item.id);

    try {
      await cancelBooking(item.id);
      setBookings((prev) => prev.map((booking) => (booking.id === item.id ? { ...booking, status: 'cancelled' } : booking)));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Impossible d\'annuler';
      setError(message);
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleSubmitReview() {
    if (!reviewTarget || rating < 1) return;
    setReviewLoading(true);

    try {
      await submitBookingReview(reviewTarget.id, rating, comment);
      setBookings((prev) => prev.map((booking) => (booking.id === reviewTarget.id ? { ...booking, hasReview: true } : booking)));
      setReviewTarget(null);
      setRating(0);
      setComment('');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Impossible d\'envoyer l\'avis';
      setError(message);
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(195,156,86,0.18),transparent_35%),#0B0B0F] text-white">
      <header className="sticky top-0 z-20 bg-dark/85 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/client/home')}
              className="inline-flex items-center gap-2 text-text-secondary hover:text-gold"
            >
              <ChevronLeft className="w-4 h-4" />
              Retour
            </button>
            <Calendar className="w-5 h-5 text-gold mt-0.5" />
          </div>

          <h1 className="text-2xl font-bold mt-2">Mes rendez-vous</h1>
          <p className="text-text-secondary text-sm mt-1">Suivez et gerez vos reservations</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 pb-14">
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-text-secondary hover:border-gold/30'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="w-4 h-4" />
              A venir
            </span>
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/10">{upcomingItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'pending' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-text-secondary hover:border-gold/30'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="w-4 h-4" />
              En attente
            </span>
            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-white/10">{pendingItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${activeTab === 'history' ? 'border-gold bg-gold/10 text-gold' : 'border-white/10 text-text-secondary hover:border-gold/30'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              <History className="w-4 h-4" />
              Historique
            </span>
          </button>
        </div>

        <div className="flex items-center justify-end mb-4">
          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing || isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
          >
            {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
            Reessayer
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200 inline-flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-dark-surface p-6 text-text-secondary inline-flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Chargement des reservations...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-dark-surface p-8 text-center">
            <p className="font-semibold text-lg">
              {activeTab === 'upcoming' && 'Aucun rendez-vous a venir'}
              {activeTab === 'pending' && 'Aucune reservation en attente'}
              {activeTab === 'history' && 'Aucun historique pour le moment'}
            </p>
            <p className="text-text-secondary mt-2 text-sm">Vous pouvez reserver un nouveau rendez-vous en quelques clics.</p>
            <Link to="/salon/testtt" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-gold text-black font-bold">
              <Calendar className="w-4 h-4" />
              Reserver maintenant
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden">
                <div className="grid md:grid-cols-[220px_1fr]">
                  <div className="h-40 md:h-full">
                    <img src={item.image} alt={item.salon} className="w-full h-full object-cover" />
                  </div>

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-bold leading-tight">{item.salon}</h3>
                        <p className="text-xs text-text-muted mt-1">{item.address}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full ${statusBadge(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid sm:grid-cols-2 gap-2.5 text-sm">
                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">Service</p>
                        <p className="font-medium">{item.service}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">Coiffeur</p>
                        <p className="font-medium">{item.barber}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">Date</p>
                        <p className="font-medium">{item.dateLabel}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-[11px] uppercase tracking-wide text-text-muted mb-1">Heure</p>
                        <p className="font-medium">{item.time}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-gold font-bold text-lg">{item.price} MAD</p>

                      <div className="flex flex-wrap gap-2 justify-end">
                        {(item.status === 'pending' || item.status === 'confirmed') && (
                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => void handleCancel(item)}
                            className="px-3 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 text-sm font-medium disabled:opacity-60"
                          >
                            {actionLoadingId === item.id ? 'Annulation...' : 'Annuler'}
                          </button>
                        )}

                        {item.status === 'done' && !item.hasReview && (
                          <button
                            type="button"
                            onClick={() => setReviewTarget(item)}
                            className="px-3 py-2 rounded-lg border border-gold/30 bg-gold/10 text-gold text-sm font-medium"
                          >
                            Laisser un avis
                          </button>
                        )}

                        {item.status === 'done' && (
                          <Link
                            to="/salon/testtt"
                            className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-text-primary text-sm font-medium"
                          >
                            Reprendre RDV
                          </Link>
                        )}

                        {item.status === 'cancelled' && (
                          <Link
                            to="/salon/testtt"
                            className="px-3 py-2 rounded-lg border border-gold/30 bg-gold/10 text-gold text-sm font-medium"
                          >
                            Reserver a nouveau
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {reviewTarget && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => {
              if (reviewLoading) return;
              setReviewTarget(null);
              setRating(0);
              setComment('');
            }}
            className="absolute inset-0 bg-black/70"
          />

          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 max-w-lg mx-auto px-4">
            <div className="rounded-2xl border border-white/10 bg-dark-surface p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">Laisser un avis</h3>
                <button
                  type="button"
                  onClick={() => {
                    if (reviewLoading) return;
                    setReviewTarget(null);
                    setRating(0);
                    setComment('');
                  }}
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              <p className="text-sm text-text-secondary mb-4">
                Votre experience chez <span className="text-text-primary font-semibold">{reviewTarget.salon}</span>
              </p>

              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" onClick={() => setRating(value)} className="p-1">
                    <Star className={`w-6 h-6 ${value <= rating ? 'fill-gold text-gold' : 'text-zinc-500'}`} />
                  </button>
                ))}
              </div>

              <label className="block mb-4">
                <span className="text-sm text-text-secondary inline-flex items-center gap-1.5 mb-2"><MessageSquare className="w-4 h-4" />Commentaire (optionnel)</span>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Partagez votre avis..."
                  className="w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm outline-none focus:border-gold/40"
                />
              </label>

              <button
                type="button"
                disabled={reviewLoading || rating < 1}
                onClick={() => void handleSubmitReview()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-gold text-black font-bold py-3 disabled:opacity-50"
              >
                {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                Envoyer l'avis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, Clock3, Heart, MapPin, Menu, Scissors, Star, User, UserCircle2, X } from 'lucide-react';
import { clearAuthSession, getStoredToken, isAuthenticated } from '../services/authService';

type UserProfile = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  roles: string[];
  bookings_count: number;
  notifications_count: number;
};

type UpcomingBooking = {
  id: number;
  date: string;
  time: string;
  salon_name: string;
  service_name: string;
  barber_name: string;
};

type FavoriteSalon = {
  id: number;
  name: string;
  address: string;
  rating: number;
  reviews_count: number;
  distance: string;
  is_open: boolean;
  image: string;
};

const API_BASE = 'https://beautybooking-f05a760bafaf.herokuapp.com/api';

const mockUser: UserProfile = {
  id: 0,
  name: 'Client Coifly',
  email: 'client@coifly.app',
  phone: null,
  roles: ['client'],
  bookings_count: 0,
  notifications_count: 0,
};

const mockFavorites: FavoriteSalon[] = [
  {
    id: 0,
    name: 'Elite Barber',
    address: 'Centre-ville',
    rating: 4.9,
    reviews_count: 120,
    distance: '1.2 km',
    is_open: true,
    image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800&auto=format&fit=crop',
  },
];

function authHeaders() {
  const token = getStoredToken();
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function getProfile(): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE}/user/profile`, { headers: authHeaders() });
  if (!response.ok) return null;
  const body = await readJson(response);
  const data = body?.data || body;
  return {
    id: Number(data?.id || 0),
    name: data?.name || 'Client',
    email: data?.email || null,
    phone: data?.phone || null,
    roles: Array.isArray(data?.roles) ? data.roles : ['client'],
    bookings_count: Number(data?.bookings_count || 0),
    notifications_count: Number(data?.notifications_count || 0),
  };
}

async function getUpcomingBooking(): Promise<UpcomingBooking | null> {
  const response = await fetch(`${API_BASE}/bookings/upcoming`, { headers: authHeaders() });
  if (!response.ok) return null;
  const body = await readJson(response);
  const data = body?.data || body;
  if (!data?.id) return null;

  return {
    id: Number(data.id),
    date: data.date || '',
    time: data.time || '',
    salon_name: data.salon_name || data.salon?.name || 'Salon',
    service_name: data.service_name || data.service?.name || 'Service',
    barber_name: data.barber_name || data.barber?.name || 'Coiffeur',
  };
}

async function getFavoriteSalons(): Promise<FavoriteSalon[] | null> {
  const response = await fetch(`${API_BASE}/salons/favorites`, { headers: authHeaders() });
  if (!response.ok) return null;
  const body = await readJson(response);
  const favorites = Array.isArray(body?.data?.favorites)
    ? body.data.favorites
    : Array.isArray(body?.favorites)
      ? body.favorites
      : [];

  return favorites.map((salon: any) => ({
    id: Number(salon?.id || 0),
    name: salon?.name || 'Salon',
    address: salon?.address || 'Adresse non disponible',
    rating: Number(salon?.rating || 0),
    reviews_count: Number(salon?.reviews_count || 0),
    distance: salon?.distance || '',
    is_open: Boolean(salon?.is_open),
    image: salon?.image || salon?.images?.[0] || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop',
  }));
}

async function getUnreadCount(): Promise<number | null> {
  const response = await fetch(`${API_BASE}/notifications/count`, { headers: authHeaders() });
  if (!response.ok) return null;
  const body = await readJson(response);
  return Number(body?.data?.unread_count ?? body?.unread_count ?? 0);
}

async function getUserLocation(): Promise<string | null> {
  const response = await fetch(`${API_BASE}/user/location`, { headers: authHeaders() });
  if (!response.ok) return null;
  const body = await readJson(response);
  const data = body?.data || body;
  const city = data?.city || '';
  const country = data?.country || '';
  return [city, country].filter(Boolean).join(', ');
}

function formatBookingDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }
  return parsed.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function HomeClientPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [profile, setProfile] = useState<UserProfile>(mockUser);
  const [upcoming, setUpcoming] = useState<UpcomingBooking | null>(null);
  const [favorites, setFavorites] = useState<FavoriteSalon[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [unreadCount, setUnreadCount] = useState(0);
  const [locationLabel, setLocationLabel] = useState('Beni Mellal, Maroc');

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { redirectTo: '/client/home' }, replace: true });
      return;
    }

    async function loadHomeData() {
      setLoading(true);

      const [profileRes, upcomingRes, favoritesRes, notifRes, locationRes] = await Promise.allSettled([
        getProfile(),
        getUpcomingBooking(),
        getFavoriteSalons(),
        getUnreadCount(),
        getUserLocation(),
      ]);

      const profileData = profileRes.status === 'fulfilled' ? profileRes.value : null;
      const upcomingData = upcomingRes.status === 'fulfilled' ? upcomingRes.value : null;
      const favoritesData = favoritesRes.status === 'fulfilled' ? favoritesRes.value : null;
      const notifData = notifRes.status === 'fulfilled' ? notifRes.value : null;
      const locationData = locationRes.status === 'fulfilled' ? locationRes.value : null;

      setProfile(profileData || mockUser);
      setUpcoming(upcomingData || null);

      const finalFavorites = favoritesData && favoritesData.length > 0 ? favoritesData : mockFavorites;
      setFavorites(finalFavorites);
      setFavoriteIds(new Set(finalFavorites.map((salon) => salon.id)));

      setUnreadCount(typeof notifData === 'number' ? notifData : 0);
      setLocationLabel(locationData || 'Beni Mellal, Maroc');
      setLoading(false);
    }

    void loadHomeData();
  }, [navigate]);

  function toggleFavoriteLocal(salonId: number) {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(salonId)) {
        next.delete(salonId);
      } else {
        next.add(salonId);
      }
      return next;
    });
  }

  function handleLogout() {
    clearAuthSession();
    setDrawerOpen(false);
    navigate('/', { replace: true });
  }

  const userContact = useMemo(() => profile.email || profile.phone || 'client@coifly.app', [profile.email, profile.phone]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(195,156,86,0.2),transparent_35%),#0B0B0F] text-white">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-dark/75 border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-gold font-bold">B</div>
            <div>
              <p className="text-sm text-text-muted">Bonjour</p>
              <h1 className="font-bold">Coifly</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl bg-dark-surface border border-white/10">
              <Bell className="w-5 h-5 text-text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            <button onClick={() => setDrawerOpen(true)} className="p-2.5 rounded-xl bg-dark-surface border border-white/10">
              <Menu className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-14 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Prochain RDV</h2>
            <p className="text-sm text-text-muted">{locationLabel}</p>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-dark-surface border border-white/10 p-5 text-text-secondary">Chargement...</div>
          ) : upcoming ? (
            <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-dark-surface border border-gold/20 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(195,156,86,0.22),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.18),transparent_35%)]" />
              <div className="absolute -right-12 -top-12 w-52 h-52 rounded-full bg-gold/15 blur-3xl" />
              <div className="absolute -left-10 -bottom-16 w-56 h-56 rounded-full bg-amber-500/10 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-2 bg-gradient-gold text-black px-3 py-1 rounded-full text-xs font-bold border border-black/10">
                    <Calendar className="w-3.5 h-3.5" />
                    Confirme
                  </span>
                  <span className="text-xs bg-white/5 border border-white/15 text-text-secondary px-2.5 py-1 rounded-full font-medium">Prochain passage</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-text-primary">{upcoming.salon_name}</h3>
                <p className="text-sm mt-1.5 text-gold/90">{formatBookingDate(upcoming.date)}</p>

                <div className="h-px my-4 bg-gradient-to-r from-gold/50 via-gold/10 to-transparent" />

                <div className="grid sm:grid-cols-3 gap-2.5 mt-5">
                  <div className="rounded-xl bg-black/25 border border-gold/20 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-gold/80 mb-1">Service</p>
                    <p className="text-sm font-semibold text-text-primary inline-flex items-center gap-1.5"><Scissors className="w-3.5 h-3.5 text-gold" />{upcoming.service_name}</p>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-gold/20 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-gold/80 mb-1">Horaire</p>
                    <p className="text-sm font-semibold text-text-primary inline-flex items-center gap-1.5"><Clock3 className="w-3.5 h-3.5 text-gold" />{upcoming.time}</p>
                  </div>
                  <div className="rounded-xl bg-black/25 border border-gold/20 px-3 py-2.5">
                    <p className="text-[11px] uppercase tracking-wide text-gold/80 mb-1">Coiffeur</p>
                    <p className="text-sm font-semibold text-text-primary inline-flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gold" />{upcoming.barber_name}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <Link
                    to="/salon/testtt"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-gold text-black font-bold hover:shadow-gold transition-all duration-300 hover:-translate-y-0.5"
                  >
                    Voir le detail
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-dark-surface p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(195,156,86,0.2),transparent_40%),radial-gradient(circle_at_85%_20%,rgba(245,158,11,0.12),transparent_35%)]" />
              <div className="absolute -right-14 -top-14 w-52 h-52 rounded-full bg-gold/12 blur-3xl" />

              <div className="relative text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
                <div className="sm:max-w-[65%]">
                  <div className="inline-flex items-center gap-3 px-3 py-2 rounded-2xl bg-black/25 border border-gold/20 mb-4">
                    <img src="/images/logo.png" alt="Coifly" className="h-9 w-9 object-contain" />
                    <div className="text-left">
                      <p className="text-gold text-xs tracking-[0.2em] uppercase">Coifly</p>
                      <p className="text-text-primary font-semibold text-sm">Aucun RDV planifie</p>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight text-text-primary">
                    Votre style parfait commence
                    <span className="block text-gold">par un prochain rendez-vous.</span>
                  </h3>
                  <p className="text-text-secondary mt-3 max-w-xl">
                    Trouvez votre salon favori, choisissez le meilleur coiffeur et reservez en quelques secondes.
                  </p>
                </div>

                <div className="mt-6 sm:mt-0">
                  <Link
                    to="/salon/testtt"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-gold text-black font-bold hover:shadow-gold transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Calendar className="w-4 h-4" />
                    Reserver maintenant
                  </Link>
                </div>
              </div>
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold">Mes salons favoris</h2>
          </div>

          {favorites.length === 0 ? (
            <div className="rounded-2xl bg-dark-surface border border-white/10 p-5 text-text-secondary">Aucun salon favori.</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((salon) => {
                const liked = favoriteIds.has(salon.id);
                return (
                  <article key={salon.id} className="rounded-2xl overflow-hidden bg-dark-surface border border-white/10">
                    <div className="h-32 relative">
                      <img src={salon.image} alt={salon.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 top-0 p-2 flex items-center justify-between">
                        <span className={`text-[11px] px-2 py-1 rounded-full ${salon.is_open ? 'bg-emerald-500/80 text-white' : 'bg-zinc-700/90 text-zinc-200'}`}>
                          {salon.is_open ? 'Ouvert' : 'Ferme'}
                        </span>
                        {salon.reviews_count > 100 && (
                          <span className="text-[11px] px-2 py-1 rounded-full bg-gold/90 text-black font-semibold">Populaire</span>
                        )}
                      </div>
                      <button onClick={() => toggleFavoriteLocal(salon.id)} className="absolute right-2 bottom-2 p-2 rounded-full bg-black/45">
                        <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold leading-tight">{salon.name}</h3>
                      <p className="text-xs text-text-muted mt-1 line-clamp-1">{salon.address}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-text-secondary">
                        <span className="inline-flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-gold text-gold" />{salon.rating.toFixed(1)} ({salon.reviews_count})</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{salon.distance}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {drawerOpen && (
        <div className="fixed inset-0 z-40">
          <button className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} aria-label="Fermer" />
          <aside className="absolute right-0 top-0 h-full w-[320px] max-w-[90vw] bg-dark-surface border-l border-white/10 p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Menu client</h3>
              <button onClick={() => setDrawerOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <div className="rounded-xl border border-white/10 p-4 mb-5">
              <div className="flex items-center gap-3">
                <UserCircle2 className="w-10 h-10 text-gold" />
                <div>
                  <p className="font-semibold">{profile.name}</p>
                  <p className="text-xs text-text-muted">{userContact}</p>
                </div>
              </div>
              <span className="inline-flex mt-3 text-xs px-2 py-1 rounded-full bg-gold/20 text-gold border border-gold/30">Client</span>
            </div>

            <nav className="space-y-2 text-sm">
              <Link to="/client/bookings" onClick={() => setDrawerOpen(false)} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5">Mes reservations <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{profile.bookings_count}</span></Link>
              <a className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5" href="#">Notifications <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{unreadCount}</span></a>
              <a className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5" href="#">Mon profil <ChevronRight className="w-4 h-4" /></a>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full mt-3 px-3 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 text-left hover:bg-red-500/15 transition-colors"
              >
                Se deconnecter
              </button>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

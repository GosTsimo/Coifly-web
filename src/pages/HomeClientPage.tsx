import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Calendar, ChevronRight, Heart, MapPin, Menu, Star, UserCircle2, X } from 'lucide-react';
import { getStoredToken, isAuthenticated } from '../services/authService';

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

const mockUpcomingBooking: UpcomingBooking | null = {
  id: 0,
  date: new Date().toISOString().slice(0, 10),
  time: '14:00',
  salon_name: 'Barber Club Premium',
  service_name: 'Coupe + Barbe',
  barber_name: 'Yassine',
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
      setUpcoming(upcomingData || mockUpcomingBooking);

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
            <div className="rounded-2xl p-5 bg-gradient-to-br from-gold/85 to-amber-500/85 text-black shadow-lg">
              <div className="inline-flex items-center gap-2 bg-black/15 px-3 py-1 rounded-full text-xs font-semibold mb-3">Confirme</div>
              <h3 className="text-2xl font-bold leading-tight">{upcoming.salon_name}</h3>
              <p className="text-sm mt-1">{upcoming.service_name} · {upcoming.time}</p>
              <p className="text-sm mt-1">Avec {upcoming.barber_name}</p>
              <p className="text-sm mt-3 opacity-80">{upcoming.date}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-dark-surface border border-white/10 p-5">
              <p className="text-text-secondary mb-4">Aucun rendez-vous a venir.</p>
              <Link to="/salon/testtt" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold text-black font-semibold">
                <Calendar className="w-4 h-4" />
                Reserver maintenant
              </Link>
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
              <a className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5" href="#">Mes reservations <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{profile.bookings_count}</span></a>
              <a className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5" href="#">Notifications <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{unreadCount}</span></a>
              <a className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5" href="#">Mon profil <ChevronRight className="w-4 h-4" /></a>
              <button className="w-full mt-3 px-3 py-2 rounded-lg border border-gold/40 text-gold text-left">Basculer vers mode coiffeur</button>
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
}

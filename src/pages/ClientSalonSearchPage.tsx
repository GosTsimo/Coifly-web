import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeDollarSign,
  Filter,
  Heart,
  Map,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
} from 'lucide-react';
import { isAuthenticated } from '../services/authService';
import {
  getSalonCategories,
  getStoredFavoriteSalonIds,
  saveFavoriteSalonIds,
  searchSalons,
  toggleSalonFavorite,
  type SearchSalonItem,
} from '../services/salonsService';

type ViewMode = 'list' | 'map';
type SortMode = 'rating' | 'price' | 'distance' | null;
type UserLocation = { latitude: number; longitude: number } | null;

const DEFAULT_CATEGORIES = ['barber', 'femme', 'spa', 'mixte'];

function FilterChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm border transition-all ${active ? 'bg-gradient-gold text-black border-gold shadow-lg shadow-gold/10' : 'bg-dark-surface text-text-secondary border-white/10 hover:border-gold/30 hover:text-text-primary'}`}
    >
      {label}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden bg-dark-surface border border-white/10 animate-pulse">
      <div className="h-44 bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-white/10 rounded w-2/3" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
    </div>
  );
}

function SalonListCard({
  salon,
  onFavorite,
}: {
  salon: SearchSalonItem;
  onFavorite: (salonId: number, nextFavorite: boolean) => void;
}) {
  return (
    <article className="group rounded-3xl overflow-hidden bg-dark-surface border border-white/10 hover:border-gold/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
      <div className="relative h-48 overflow-hidden">
        <img src={salon.image} alt={salon.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${salon.is_open ? 'bg-emerald-500/85 text-white' : 'bg-zinc-800/90 text-zinc-200'}`}>
            {salon.is_open ? 'Ouvert' : 'Ferme'}
          </span>
          <button
            type="button"
            onClick={() => onFavorite(salon.id, !salon.is_favorite)}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          >
            <Heart className={`w-4 h-4 ${salon.is_favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        </div>
        <div className="absolute left-4 bottom-4 right-4">
          <div className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/85 mb-2">
            <MapPin className="w-3 h-3 text-gold" />
            {salon.distance}
          </div>
          <h3 className="text-xl font-bold text-white leading-tight">{salon.name}</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 fill-gold text-gold" />{salon.rating.toFixed(1)}</span>
          <span>({salon.reviews_count} avis)</span>
          <span className="ml-auto inline-flex items-center gap-1 text-gold"><BadgeDollarSign className="w-4 h-4" />Dès {salon.price_from} MAD</span>
        </div>

        <p className="text-sm text-text-muted mt-3 line-clamp-2">{salon.address}</p>

        {salon.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {salon.categories.slice(0, 3).map((category) => (
              <span key={category} className="text-[11px] px-2.5 py-1 rounded-full border border-gold/20 bg-gold/10 text-gold uppercase tracking-wide">
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function computePinPosition(value: number, min: number, max: number) {
  if (max === min) {
    return 50;
  }
  return 10 + ((value - min) / (max - min)) * 80;
}

export default function ClientSalonSearchPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [salons, setSalons] = useState<SearchSalonItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>(getStoredFavoriteSalonIds());
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const selectedSort = useMemo<SortMode>(() => {
    if (activeFilters.includes('rating')) return 'rating';
    if (activeFilters.includes('price')) return 'price';
    if (activeFilters.includes('distance')) return 'distance';
    return null;
  }, [activeFilters]);

  const selectedCategories = useMemo(
    () => activeFilters.filter((filter) => !['open', 'rating', 'price', 'distance'].includes(filter)),
    [activeFilters]
  );

  async function loadSalons(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const results = await searchSalons({
      q: searchQuery.trim() || undefined,
      category: selectedCategories,
      is_open: activeFilters.includes('open') ? true : undefined,
      sort: selectedSort || undefined,
      latitude: userLocation?.latitude,
      longitude: userLocation?.longitude,
      page: 1,
      per_page: 50,
    });

    const favoriteSet = new Set(favorites);
    const merged = results.map((salon) => ({ ...salon, is_favorite: favoriteSet.has(salon.id) || salon.is_favorite }));

    if (results.length === 0 && (searchQuery || activeFilters.length > 0)) {
      setError('Aucun salon ne correspond à votre recherche.');
    }

    setSalons(merged);
    setIsLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { redirectTo: '/client/salons' }, replace: true });
      return;
    }

    async function loadInitialData() {
      setIsLoading(true);
      const [categoriesRes, salonsRes] = await Promise.all([
        getSalonCategories(),
        searchSalons({ page: 1, per_page: 50 }),
      ]);

      const favoriteSet = new Set(getStoredFavoriteSalonIds());
      setCategories(categoriesRes.length > 0 ? categoriesRes : DEFAULT_CATEGORIES);
      setSalons(salonsRes.map((salon) => ({ ...salon, is_favorite: favoriteSet.has(salon.id) || salon.is_favorite })));
      setIsLoading(false);
    }

    void loadInitialData();

    if (!navigator.geolocation) {
      setLocationPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationPermission('granted');
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setLocationPermission('denied');
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated()) return;
    if (isLoading && salons.length === 0) return;
    void loadSalons();
  }, [searchQuery, activeFilters, userLocation]);

  function toggleFilter(filter: string) {
    setActiveFilters((prev) => {
      const sortFilters = ['rating', 'price', 'distance'];
      if (sortFilters.includes(filter)) {
        if (prev.includes(filter)) {
          return prev.filter((item) => item !== filter);
        }
        return [...prev.filter((item) => !sortFilters.includes(item)), filter];
      }

      if (prev.includes(filter)) {
        return prev.filter((item) => item !== filter);
      }
      return [...prev, filter];
    });
  }

  async function handleFavorite(salonId: number, nextFavorite: boolean) {
    const previous = favorites;
    const nextFavorites = nextFavorite ? [...previous, salonId] : previous.filter((id) => id !== salonId);
    setFavorites(nextFavorites);
    saveFavoriteSalonIds(nextFavorites);
    setSalons((prev) => prev.map((salon) => (salon.id === salonId ? { ...salon, is_favorite: nextFavorite } : salon)));

    const result = await toggleSalonFavorite(salonId);
    if (!result.success) {
      setFavorites(previous);
      saveFavoriteSalonIds(previous);
      setSalons((prev) => prev.map((salon) => (salon.id === salonId ? { ...salon, is_favorite: !nextFavorite } : salon)));
    }
  }

  function handleSalonPress(salon: SearchSalonItem) {
    const slugOrId = salon.slug || String(salon.id);
    navigate(`/salon/${slugOrId}`);
  }

  const mapSalons = useMemo(
    () => salons.filter((salon) => typeof salon.latitude === 'number' && typeof salon.longitude === 'number'),
    [salons]
  );

  const mapCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    if (mapSalons.length > 0) {
      return {
        latitude: mapSalons[0].latitude as number,
        longitude: mapSalons[0].longitude as number,
      };
    }
    return null;
  }, [mapSalons, userLocation]);

  const coordinateBounds = useMemo(() => {
    if (mapSalons.length === 0) {
      return null;
    }
    const latitudes = mapSalons.map((salon) => salon.latitude as number);
    const longitudes = mapSalons.map((salon) => salon.longitude as number);
    return {
      minLat: Math.min(...latitudes),
      maxLat: Math.max(...latitudes),
      minLng: Math.min(...longitudes),
      maxLng: Math.max(...longitudes),
    };
  }, [mapSalons]);

  const mapEmbedUrl = useMemo(() => {
    if (!mapCenter) {
      return null;
    }
    return `https://www.google.com/maps?q=${mapCenter.latitude},${mapCenter.longitude}&z=13&output=embed`;
  }, [mapCenter]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,rgba(195,156,86,0.16),transparent_25%),radial-gradient(circle_at_90%_10%,rgba(245,158,11,0.12),transparent_25%),#0B0B0F] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <header className="mb-6 rounded-3xl border border-white/10 bg-dark-surface/80 backdrop-blur p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <Link to="/client/home" className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors mb-4">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-gradient-gold text-black flex items-center justify-center shadow-lg shadow-gold/15">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">Explorer</p>
                  <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Trouvez votre prochain salon</h1>
                </div>
              </div>
              <p className="text-text-secondary max-w-2xl">Cherchez par nom, filtrez par catégorie et comparez les meilleurs salons autour de vous en un seul écran.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border ${viewMode === 'list' ? 'bg-gradient-gold text-black border-gold' : 'border-white/10 bg-dark text-text-secondary'}`}
              >
                <Filter className="w-4 h-4" />
                Liste
              </button>
              <button
                type="button"
                onClick={() => setViewMode('map')}
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border ${viewMode === 'map' ? 'bg-gradient-gold text-black border-gold' : 'border-white/10 bg-dark text-text-secondary'}`}
              >
                <Map className="w-4 h-4" />
                Carte
              </button>
            </div>
          </div>

          <div className="mt-6 grid lg:grid-cols-[1fr_auto] gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Search className="w-5 h-5 text-gold" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un salon, une specialite, un quartier..."
                className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-muted"
              />
            </div>
            <button
              type="button"
              onClick={() => void loadSalons(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-dark border border-gold/25 text-gold font-semibold"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <FilterChip active={activeFilters.includes('open')} label="Ouvert maintenant" onClick={() => toggleFilter('open')} />
            <FilterChip active={activeFilters.includes('rating')} label="Mieux notés" onClick={() => toggleFilter('rating')} />
            <FilterChip active={activeFilters.includes('price')} label="Prix" onClick={() => toggleFilter('price')} />
            <FilterChip active={activeFilters.includes('distance')} label="Distance" onClick={() => toggleFilter('distance')} />
            {categories.map((category) => (
              <FilterChip
                key={category}
                active={activeFilters.includes(category)}
                label={category}
                onClick={() => toggleFilter(category)}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3 text-sm text-text-muted">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>{locationPermission === 'granted' ? 'Recherche optimisée autour de votre position' : 'Activez la localisation pour trier les salons proches de vous'}</span>
          </div>
        </header>

        {error && !isLoading && salons.length === 0 && (
          <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-red-100 mb-6">
            <p className="font-semibold">{error}</p>
            <button type="button" onClick={() => void loadSalons(true)} className="mt-3 text-sm text-gold underline underline-offset-4">
              Réessayer
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : viewMode === 'list' ? (
          salons.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {salons.map((salon) => (
                <SalonListCard key={salon.id} salon={salon} onFavorite={handleFavorite} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-dark-surface/80 p-8 text-center">
              <p className="text-lg font-semibold">Aucun salon trouvé</p>
              <p className="text-text-secondary mt-2">Essayez une autre recherche ou désactivez certains filtres.</p>
            </div>
          )
        ) : (
          <div className="rounded-3xl overflow-hidden border border-white/10 bg-dark-surface/85 min-h-[620px] relative">
            {mapEmbedUrl ? (
              <>
                <iframe
                  title="Carte interactive des salons"
                  src={mapEmbedUrl}
                  className="w-full h-[620px]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {coordinateBounds &&
                  mapSalons.map((salon) => {
                    const left = computePinPosition(salon.longitude as number, coordinateBounds.minLng, coordinateBounds.maxLng);
                    const top = computePinPosition(salon.latitude as number, coordinateBounds.minLat, coordinateBounds.maxLat);

                    return (
                      <button
                        key={salon.id}
                        type="button"
                        onClick={() => handleSalonPress(salon)}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${left}%`, top: `${100 - top}%` }}
                        title={salon.name}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-gold text-black font-bold shadow-lg shadow-gold/25 border-4 border-black/25 flex items-center justify-center">
                          {salon.name.charAt(0)}
                        </div>
                      </button>
                    );
                  })}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                <div className="text-center px-6">
                  <Map className="w-10 h-10 mx-auto text-gold mb-3" />
                  <p className="font-semibold">Carte indisponible</p>
                  <p className="text-sm mt-1">Les coordonnées salons sont absentes pour cette recherche.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
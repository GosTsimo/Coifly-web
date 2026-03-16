import { getStoredToken } from './authService';

const API_BASE = 'https://beautybooking-f05a760bafaf.herokuapp.com/api';
const FAVORITES_STORAGE_KEY = 'salon_favorite_ids';

export type SearchSalonItem = {
  id: number;
  slug: string | null;
  salon_url: string | null;
  name: string;
  rating: number;
  reviews_count: number;
  distance: string;
  price_from: number;
  is_open: boolean;
  is_favorite: boolean;
  address: string;
  image: string;
  categories: string[];
  latitude: number | null;
  longitude: number | null;
};

export type SearchSalonsParams = {
  q?: string;
  category?: string[];
  is_open?: boolean;
  sort?: 'rating' | 'price' | 'distance';
  latitude?: number;
  longitude?: number;
  page?: number;
  per_page?: number;
};

function defaultHeaders() {
  const token = getStoredToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function buildQuery(params: SearchSalonsParams) {
  const query = new URLSearchParams();

  if (params.q) query.set('q', params.q);
  if (typeof params.is_open === 'boolean') query.set('is_open', String(params.is_open));
  if (params.sort) query.set('sort', params.sort);
  if (typeof params.latitude === 'number') query.set('latitude', String(params.latitude));
  if (typeof params.longitude === 'number') query.set('longitude', String(params.longitude));
  query.set('page', String(params.page || 1));
  query.set('per_page', String(params.per_page || 50));

  (params.category || []).forEach((category) => query.append('category[]', category));

  return query.toString();
}

function safeCoordinate(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed === 0) {
    return null;
  }
  return parsed;
}

function normalizeCategoryValue(category: unknown): string {
  if (typeof category === 'string') {
    return category;
  }

  if (category && typeof category === 'object') {
    const candidate = category as {
      slug?: unknown;
      name?: unknown;
      label?: unknown;
      title?: unknown;
      type?: unknown;
    };

    const preferred = candidate.slug ?? candidate.name ?? candidate.label ?? candidate.title ?? candidate.type;
    if (typeof preferred === 'string') {
      return preferred;
    }
  }

  return '';
}

function mapApiSalonToUI(salon: any, favoriteIds = new Set<number>()): SearchSalonItem {
  const latitude = safeCoordinate(salon?.latitude ?? salon?.coordinates?.latitude);
  const longitude = safeCoordinate(salon?.longitude ?? salon?.coordinates?.longitude);

  return {
    id: Number(salon?.id || 0),
    slug: salon?.slug || null,
    salon_url: salon?.salon_url || null,
    name: salon?.name || 'Salon',
    rating: Number(salon?.rating || 0),
    reviews_count: Number(salon?.reviews_count || 0),
    distance: salon?.distance || 'N/A',
    price_from: Number(salon?.price_from || 0),
    is_open: Boolean(salon?.is_open),
    is_favorite: favoriteIds.has(Number(salon?.id || 0)) || Boolean(salon?.is_favorite),
    address: salon?.address || 'Adresse non disponible',
    image:
      salon?.image ||
      salon?.images?.[0] ||
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&auto=format&fit=crop',
    categories: Array.isArray(salon?.categories)
      ? salon.categories.map((category: unknown) => normalizeCategoryValue(category)).filter(Boolean)
      : [],
    latitude,
    longitude,
  };
}

export function getStoredFavoriteSalonIds(): number[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteSalonIds(ids: number[]) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
}

export async function getSalonCategories(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE}/salons/categories`, {
      method: 'GET',
      headers: defaultHeaders(),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return [];
    }
    const categories = Array.isArray(body?.data?.categories)
      ? body.data.categories
      : Array.isArray(body?.categories)
        ? body.categories
        : [];
    return categories.map((category: unknown) => normalizeCategoryValue(category)).filter(Boolean);
  } catch {
    return [];
  }
}

export async function searchSalons(params: SearchSalonsParams): Promise<SearchSalonItem[]> {
  const query = buildQuery(params);
  const favoriteIds = new Set(getStoredFavoriteSalonIds());

  try {
    const response = await fetch(`${API_BASE}/salons/search${query ? `?${query}` : ''}`, {
      method: 'GET',
      headers: defaultHeaders(),
    });
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      return [];
    }
    const data = body?.data || body;
    const salons = Array.isArray(data?.salons)
      ? data.salons
      : Array.isArray(body?.salons)
        ? body.salons
        : [];
    return salons.map((salon: any) => mapApiSalonToUI(salon, favoriteIds)).filter((salon: SearchSalonItem) => salon.id > 0);
  } catch {
    return [];
  }
}

export async function toggleSalonFavorite(salonId: number): Promise<{
  success: boolean;
  is_favorite?: boolean;
  message?: string;
}> {
  const token = getStoredToken();

  if (!token) {
    return {
      success: false,
      message: 'Utilisateur non connecte',
    };
  }

  try {
    const response = await fetch(`${API_BASE}/salons/${salonId}/toggle-favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        message: body?.message || `Erreur API (${response.status})`,
      };
    }

    const data = body?.data || body;
    const parsedFavorite =
      typeof data?.is_favorite === 'boolean'
        ? data.is_favorite
        : typeof data?.salon?.is_favorite === 'boolean'
          ? data.salon.is_favorite
          : undefined;

    return {
      success: true,
      is_favorite: parsedFavorite,
      message: body?.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur de connexion',
    };
  }
}

export default {
  getSalonCategories,
  searchSalons,
  getStoredFavoriteSalonIds,
  saveFavoriteSalonIds,
  toggleSalonFavorite,
};
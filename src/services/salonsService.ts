import { getStoredToken } from './authService';

const API_BASE = 'https://beautybooking-f05a760bafaf.herokuapp.com/api';

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
  toggleSalonFavorite,
};
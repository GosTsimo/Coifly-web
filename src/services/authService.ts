const API_BASE = 'https://beautybooking-f05a760bafaf.herokuapp.com/api';
const TOKEN_KEY = 'coifly_token';
const USER_KEY = 'coifly_user';

type AuthResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export type AuthUser = {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  roles?: string[];
};

export type LoginData = {
  user: AuthUser;
  token: string;
};

export type RegisterPayload = {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  password_confirmation: string;
};

export type DevicePayload = {
  device_token: string;
  device_type: string;
  device_name?: string | null;
};

function getErrorMessage(status: number, fallback = 'Une erreur est survenue') {
  if (status === 401) {
    return 'Email/telephone ou mot de passe incorrect';
  }
  return fallback;
}

async function parseJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  const token = localStorage.getItem(TOKEN_KEY);
  console.debug('[Auth] Getting stored token', { hasToken: !!token });
  return token;
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function storeAuthSession(data: LoginData) {
  console.debug('[Auth] Storing auth session', { userId: data.user.id, hasToken: !!data.token })
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  console.debug('[Auth] Auth session stored successfully')
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function loginUser(emailOrPhone: string, password: string): Promise<AuthResponse<LoginData>> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      email_or_phone: emailOrPhone,
      password,
    }),
  });

  const payload = await parseJson(response);

  if (!response.ok) {
    return {
      success: false,
      message: payload?.message || getErrorMessage(response.status),
      errors: payload?.errors || {},
    };
  }

  const data = payload?.data as LoginData;
  if (data?.token) {
    storeAuthSession(data);
  }

  return {
    success: true,
    data,
    message: payload?.message || 'Connexion reussie',
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse<LoginData>> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const body = await parseJson(response);

  if (!response.ok) {
    return {
      success: false,
      message: body?.message || 'Erreur de validation',
      errors: body?.errors || {},
    };
  }

  const data = body?.data as LoginData;
  if (data?.token) {
    storeAuthSession(data);
  }

  return {
    success: true,
    data,
    message: body?.message || 'Inscription reussie',
  };
}

export async function addDevice(device: DevicePayload): Promise<AuthResponse<unknown>> {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE}/auth/add-device`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      device_token: device.device_token,
      device_type: device.device_type,
      device_name: device.device_name || null,
    }),
  });

  const body = await parseJson(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    return {
      success: false,
      message: body?.message || 'Erreur lors de l\'enregistrement du device',
      errors: body?.errors || {},
    };
  }

  return {
    success: true,
    data: body?.data,
    message: body?.message || 'Device enregistre',
  };
}

export default {
  loginUser,
  registerUser,
  addDevice,
  getStoredToken,
  isAuthenticated,
  clearAuthSession,
};
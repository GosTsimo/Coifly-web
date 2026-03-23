export interface BookingServiceItem {
  id: number;
  name: string;
  price: number;
  duration: number;
  description: string;
  category: string;
}

export interface BookingBarber {
  id: number;
  name: string;
  photo_url: string;
  rating_average: number;
  speciality: string;
  reviews_count: number;
  services: Array<{ id: number }>;
}

export interface BookingSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  total_duration: number;
  is_single_barber: boolean;
  services: Array<{ id: number; name: string }>;
}

export interface CreateBookingPayload {
  salon_id: number;
  service_ids: number[];
  date: string;
  time: string;
  barber_assignments: Record<string, number | null>;
}

const API_BASE = 'https://api1.coifly.app/api';
const TOKEN_KEY = 'coifly_token';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function defaultHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse(response: Response) {
  let body: any = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(body?.message || `API error (${response.status})`);
  }

  return body;
}

function normalizeService(raw: any): BookingServiceItem {
  return {
    id: Number(raw?.id),
    name: raw?.name || raw?.service_name || '',
    price: Number(raw?.price || 0),
    duration: Number(raw?.duration || 0),
    description: raw?.description || '',
    category: raw?.category || '',
  };
}

function normalizeBarber(raw: any): BookingBarber {
  return {
    id: Number(raw?.id || raw?.barber_id || 0),
    name: raw?.name || raw?.first_name || '',
    photo_url: raw?.photo_url || raw?.photo || raw?.avatar || raw?.image || '',
    rating_average: Number(raw?.rating_average || raw?.rating || raw?.average_rating || 0),
    speciality: raw?.speciality || raw?.specialty || raw?.bio || '',
    reviews_count: Number(raw?.reviews_count || 0),
    services: Array.isArray(raw?.services)
      ? raw.services.map((service: any) => ({ id: Number(service?.id) })).filter((service: { id: number }) => service.id > 0)
      : [],
  };
}

function normalizeSlot(raw: any): BookingSlot {
  return {
    start_time: raw?.start_time || raw?.time || '',
    end_time: raw?.end_time || '',
    available: raw?.available !== false,
    total_duration: Number(raw?.total_duration || 0),
    is_single_barber: Boolean(raw?.is_single_barber),
    services: Array.isArray(raw?.services)
      ? raw.services.map((service: any) => ({ id: Number(service?.id), name: service?.name || '' }))
      : [],
  };
}

export async function getSalonServices(salonId: number): Promise<{ services: BookingServiceItem[] }> {
  try {
    const response = await fetch(`${API_BASE}/salons/${salonId}/services`, {
      method: 'GET',
      headers: defaultHeaders(),
    });
    const body = await parseResponse(response);
    const data = body?.data || body;
    const services = Array.isArray(data?.services) ? data.services : Array.isArray(data) ? data : [];
    return { services: services.map(normalizeService).filter((service: BookingServiceItem) => service.id > 0) };
  } catch {
    return { services: [] };
  }
}

export async function getBarbersByServices(
  salonId: number,
  serviceIds: number[]
): Promise<{ barbers: BookingBarber[] }> {
  try {
    const response = await fetch(`${API_BASE}/reservations/barbers-by-services`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({
        salon_id: salonId,
        service_ids: serviceIds,
      }),
    });
    const body = await parseResponse(response);
    const data = body?.data || body;
    const barbers = Array.isArray(data?.barbers) ? data.barbers : [];
    return { barbers: barbers.map(normalizeBarber).filter((barber: BookingBarber) => barber.id > 0) };
  } catch {
    return { barbers: [] };
  }
}

export async function getAvailableSlots(
  salonId: number,
  date: string,
  serviceIds: number[],
  slotInterval = 15
): Promise<{ date: string; slots: BookingSlot[] }> {
  try {
    const response = await fetch(`${API_BASE}/reservations/available-slots`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({
        salon_id: salonId,
        service_ids: serviceIds,
        date,
        slot_interval: slotInterval,
      }),
    });
    const body = await parseResponse(response);
    const data = body?.data || body;
    const slots = Array.isArray(data?.slots) ? data.slots : [];
    return {
      date,
      slots: slots.map(normalizeSlot).filter((slot: BookingSlot) => !!slot.start_time),
    };
  } catch {
    return { date, slots: [] };
  }
}

export async function createBooking(payload: CreateBookingPayload): Promise<{
  success: boolean;
  data: {
    id: number;
    booking_id: string;
    salon_id: number;
    service_ids: number[];
    barber_assignments: Record<string, number | null>;
    date: string;
    time: string;
    status: string;
  };
  message?: string;
}> {
  try {
    const cleanAssignments = Object.fromEntries(
      Object.entries(payload.barber_assignments || {}).flatMap(([serviceId, barberId]) => {
        const parsedBarberId = Number(barberId);
        if (Number.isInteger(parsedBarberId) && parsedBarberId > 0) {
          return [[serviceId, parsedBarberId]];
        }
        return [];
      })
    );

    const response = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify({
        salon_id: payload.salon_id,
        service_ids: payload.service_ids,
        date: payload.date,
        time: payload.time,
        barber_assignments: cleanAssignments,
      }),
    });
    const body = await parseResponse(response);
    const data = body?.data || body;

    return {
      success: true,
      data: {
        id: Number(data?.id || 0),
        booking_id: String(data?.booking_id || data?.id || ''),
        salon_id: Number(data?.salon_id || payload.salon_id),
        service_ids: Array.isArray(data?.service_ids) ? data.service_ids : payload.service_ids,
        barber_assignments: data?.barber_assignments || payload.barber_assignments,
        date: data?.date || payload.date,
        time: data?.time || payload.time,
        status: data?.status || 'confirmed',
      },
      message: body?.message,
    };
  } catch (error) {
    return {
      success: false,
      data: {
        id: 0,
        booking_id: '',
        salon_id: payload.salon_id,
        service_ids: payload.service_ids,
        barber_assignments: payload.barber_assignments,
        date: payload.date,
        time: payload.time,
        status: 'failed',
      },
      message: error instanceof Error ? error.message : 'Creation de reservation impossible',
    };
  }
}

export default {
  getSalonServices,
  getBarbersByServices,
  getAvailableSlots,
  createBooking,
};
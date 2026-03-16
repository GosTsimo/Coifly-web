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

const mockServices: BookingServiceItem[] = [
  {
    id: 1,
    name: 'Coupe Signature',
    price: 140,
    duration: 45,
    description: 'Coupe personnalisée avec finitions premium.',
    category: 'Coupe',
  },
  {
    id: 2,
    name: 'Barbe Précision',
    price: 90,
    duration: 30,
    description: 'Taille, contours et serviette chaude.',
    category: 'Barbe',
  },
  {
    id: 3,
    name: 'Coloration Express',
    price: 220,
    duration: 75,
    description: 'Uniformisation et éclat naturel.',
    category: 'Coloration',
  },
  {
    id: 4,
    name: 'Soin Detox',
    price: 110,
    duration: 35,
    description: 'Soin profond cuir chevelu et massage.',
    category: 'Soin',
  },
  {
    id: 5,
    name: 'Brushing Expert',
    price: 120,
    duration: 40,
    description: 'Brushing structuré longue tenue.',
    category: 'Coiffage',
  },
];

const mockBarbers: BookingBarber[] = [
  {
    id: 101,
    name: 'Yassine B.',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
    rating_average: 4.9,
    speciality: 'Dégradés & texture',
    reviews_count: 214,
    services: [{ id: 1 }, { id: 2 }, { id: 4 }],
  },
  {
    id: 102,
    name: 'Sara K.',
    photo_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=300&h=300&fit=crop',
    rating_average: 4.8,
    speciality: 'Coloration premium',
    reviews_count: 187,
    services: [{ id: 1 }, { id: 3 }, { id: 5 }],
  },
  {
    id: 103,
    name: 'Rachid M.',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
    rating_average: 4.7,
    speciality: 'Barbe & rituels',
    reviews_count: 139,
    services: [{ id: 2 }, { id: 4 }],
  },
  {
    id: 104,
    name: 'Nora A.',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
    rating_average: 4.9,
    speciality: 'Brushing & style',
    reviews_count: 263,
    services: [{ id: 1 }, { id: 5 }],
  },
];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addMinutes(time: string, minutesToAdd: number): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes + minutesToAdd, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function createSlotsForDate(serviceIds: number[], slotInterval: number): BookingSlot[] {
  const picked = mockServices.filter((service) => serviceIds.includes(service.id));
  const totalDuration = Math.max(15, picked.reduce((sum, service) => sum + service.duration, 0));
  const slotStep = Math.max(15, slotInterval || 15);
  const starts = ['09:00', '09:30', '10:00', '10:30', '11:15', '12:00', '14:00', '14:45', '15:30', '16:15', '17:00'];

  return starts.map((start, index) => ({
    start_time: start,
    end_time: addMinutes(start, totalDuration),
    available: index % 4 !== 3,
    total_duration: totalDuration,
    is_single_barber: serviceIds.length === 1,
    services: picked.map((service) => ({ id: service.id, name: service.name })),
  }));
}

export async function getSalonServices(_salonId: number): Promise<{ services: BookingServiceItem[] }> {
  await wait(450);
  return { services: mockServices };
}

export async function getBarbersByServices(
  _salonId: number,
  serviceIds: number[]
): Promise<{ barbers: BookingBarber[] }> {
  await wait(500);
  const requested = new Set(serviceIds);
  const barbers = mockBarbers.filter((barber) => barber.services.some((service) => requested.has(service.id)));
  return { barbers };
}

export async function getAvailableSlots(
  _salonId: number,
  date: string,
  serviceIds: number[],
  slotInterval = 15
): Promise<{ date: string; slots: BookingSlot[] }> {
  await wait(550);
  return { date, slots: createSlotsForDate(serviceIds, slotInterval) };
}

export async function createBooking(payload: CreateBookingPayload): Promise<{
  success: true;
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
}> {
  await wait(900);
  return {
    success: true,
    data: {
      id: Math.floor(Math.random() * 100000),
      booking_id: `BK-${Date.now().toString().slice(-8)}`,
      salon_id: payload.salon_id,
      service_ids: payload.service_ids,
      barber_assignments: payload.barber_assignments,
      date: payload.date,
      time: payload.time,
      status: 'confirmed',
    },
  };
}

export default {
  getSalonServices,
  getBarbersByServices,
  getAvailableSlots,
  createBooking,
};
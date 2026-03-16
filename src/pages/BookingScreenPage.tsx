import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Check, Clock3, Scissors, Sparkles, Star, UserRound } from 'lucide-react';
import clientBookingService, {
  type BookingBarber,
  type BookingServiceItem,
  type BookingSlot,
} from '../services/clientBookingService';

type SelectedBarbers = Record<number, BookingBarber | null>;

const STEPS = ['Services', 'Coiffeurs', 'Date & Horaire', 'Confirmation'];

function toYmd(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildNextDays(count: number) {
  const labels = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
  const out: Array<{ date: Date; ymd: string; weekDay: string; label: string }> = [];
  const now = new Date();

  for (let i = 0; i < count; i += 1) {
    const current = new Date(now);
    current.setDate(now.getDate() + i);
    out.push({
      date: current,
      ymd: toYmd(current),
      weekDay: i === 0 ? 'Aujourd\'hui' : i === 1 ? 'Demain' : labels[current.getDay()],
      label: `${current.getDate()} ${months[current.getMonth()]}`,
    });
  }

  return out;
}

function formatPrice(value: number) {
  return `${value} MAD`;
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`;
  }
  return `${minutes} min`;
}

export default function BookingScreenPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const salonId = Number(location.state?.salonId ?? 1);
  const salonName = String(location.state?.salonName ?? 'Salon Premium');

  const [step, setStep] = useState(0);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingBarbers, setLoadingBarbers] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');

  const [services, setServices] = useState<BookingServiceItem[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [barbers, setBarbers] = useState<BookingBarber[]>([]);
  const [selectedBarbers, setSelectedBarbers] = useState<SelectedBarbers>({});
  const [selectedDate, setSelectedDate] = useState(buildNextDays(14)[0]);
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);

  const nextDays = useMemo(() => buildNextDays(14), []);
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [services, selectedServiceIds]
  );

  const totalPrice = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.price, 0),
    [selectedServices]
  );
  const totalDuration = useMemo(
    () => selectedServices.reduce((sum, service) => sum + service.duration, 0),
    [selectedServices]
  );

  useEffect(() => {
    async function load() {
      setLoadingServices(true);
      const result = await clientBookingService.getSalonServices(salonId);
      setServices(result.services);
      setLoadingServices(false);
    }
    void load();
  }, [salonId]);

  useEffect(() => {
    if (step !== 1 || selectedServiceIds.length === 0) {
      return;
    }

    async function loadBarbers() {
      setLoadingBarbers(true);
      const result = await clientBookingService.getBarbersByServices(salonId, selectedServiceIds);
      setBarbers(result.barbers);

      const updates: SelectedBarbers = {};
      selectedServiceIds.forEach((serviceId) => {
        updates[serviceId] = null;
      });
      setSelectedBarbers(updates);
      setLoadingBarbers(false);
    }

    void loadBarbers();
  }, [salonId, selectedServiceIds, step]);

  useEffect(() => {
    if (step !== 2 || selectedServiceIds.length === 0) {
      return;
    }

    async function loadSlots() {
      setLoadingSlots(true);
      setSelectedSlot(null);
      const result = await clientBookingService.getAvailableSlots(salonId, selectedDate.ymd, selectedServiceIds, 15);
      setSlots(result.slots);
      setLoadingSlots(false);
    }

    void loadSlots();
  }, [salonId, selectedDate, selectedServiceIds, step]);

  function toggleService(serviceId: number) {
    setSelectedServiceIds((prev) => {
      if (prev.includes(serviceId)) {
        return prev.filter((id) => id !== serviceId);
      }
      return [...prev, serviceId];
    });
  }

  function getBarbersForService(serviceId: number) {
    return barbers.filter((barber) => barber.services.some((item) => item.id === serviceId));
  }

  function autoAssignBarber(serviceId: number) {
    const forService = getBarbersForService(serviceId);
    if (forService.length === 0) {
      setSelectedBarbers((prev) => ({ ...prev, [serviceId]: null }));
      return;
    }
    const random = forService[Math.floor(Math.random() * forService.length)];
    setSelectedBarbers((prev) => ({ ...prev, [serviceId]: random }));
  }

  function canContinue() {
    if (step === 0) {
      return selectedServiceIds.length > 0;
    }
    if (step === 1) {
      return selectedServices.every((service) => {
        const candidates = getBarbersForService(service.id);
        if (candidates.length === 0) {
          return true;
        }
        return !!selectedBarbers[service.id];
      });
    }
    if (step === 2) {
      return !!selectedSlot;
    }
    return true;
  }

  async function confirmBooking() {
    if (!selectedSlot) {
      return;
    }

    setApiError('');
    setSubmitting(true);
    const assignments: Record<string, number | null> = {};
    selectedServices.forEach((service) => {
      assignments[String(service.id)] = selectedBarbers[service.id]?.id ?? null;
    });

    const response = await clientBookingService.createBooking({
      salon_id: salonId,
      service_ids: selectedServiceIds,
      date: selectedDate.ymd,
      time: selectedSlot.start_time,
      barber_assignments: assignments,
    });

    if (!response.success || !response.data.booking_id) {
      setApiError(response.message || 'Impossible de confirmer la reservation pour le moment.');
      setSubmitting(false);
      return;
    }

    setSuccessId(response.data.booking_id);
    setSubmitting(false);
  }

  function stepContent() {
    if (step === 0) {
      if (loadingServices) {
        return <p className="text-text-secondary">Chargement des services...</p>;
      }

      return (
        <div className="grid gap-4">
          {services.map((service) => {
            const selected = selectedServiceIds.includes(service.id);
            return (
              <button
                type="button"
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${selected ? 'border-gold bg-gold/10 shadow-lg shadow-gold/10' : 'border-white/10 bg-dark-surface hover:border-gold/30'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-text-primary font-semibold">{service.name}</p>
                    <p className="text-text-muted text-sm mt-1">{service.description}</p>
                    <p className="text-text-secondary text-xs mt-2 uppercase tracking-wide">{service.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-gold font-bold">{formatPrice(service.price)}</p>
                    <p className="text-text-secondary text-sm">{formatDuration(service.duration)}</p>
                  </div>
                </div>
              </button>
            );
          })}

          {selectedServices.length > 0 && (
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/15 to-amber-500/10 p-4 flex items-center justify-between">
              <div>
                <p className="text-text-primary font-semibold">{selectedServices.length} service(s)</p>
                <p className="text-text-secondary text-sm">{formatDuration(totalDuration)}</p>
              </div>
              <p className="text-gold font-bold text-lg">{formatPrice(totalPrice)}</p>
            </div>
          )}
        </div>
      );
    }

    if (step === 1) {
      if (loadingBarbers) {
        return <p className="text-text-secondary">Chargement des coiffeurs...</p>;
      }

      return (
        <div className="space-y-6">
          {selectedServices.map((service) => {
            const options = getBarbersForService(service.id);
            const selected = selectedBarbers[service.id];

            return (
              <section key={service.id} className="rounded-2xl border border-white/10 bg-dark-surface p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-text-primary font-semibold">{service.name}</p>
                    <p className="text-text-muted text-sm">1 coiffeur requis</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => autoAssignBarber(service.id)}
                    className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10"
                  >
                    <Sparkles className="w-4 h-4" />
                    Automatique
                  </button>
                </div>

                {options.length === 0 ? (
                  <p className="text-text-muted text-sm">Aucun coiffeur disponible pour ce service.</p>
                ) : (
                  <div className="grid gap-3">
                    {options.map((barber) => {
                      const isSelected = selected?.id === barber.id;
                      return (
                        <button
                          type="button"
                          key={barber.id}
                          onClick={() => setSelectedBarbers((prev) => ({ ...prev, [service.id]: barber }))}
                          className={`w-full text-left rounded-xl border p-3 transition-all ${isSelected ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-gold/30'}`}
                        >
                          <div className="flex items-center gap-3">
                            <img src={barber.photo_url} alt={barber.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className="flex-1">
                              <p className="text-text-primary font-medium">{barber.name}</p>
                              <p className="text-text-muted text-sm">{barber.speciality}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gold text-sm inline-flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                                {barber.rating_average.toFixed(1)}
                              </p>
                              <p className="text-text-muted text-xs">{barber.reviews_count} avis</p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {nextDays.map((day) => {
              const selected = day.ymd === selectedDate.ymd;
              return (
                <button
                  type="button"
                  key={day.ymd}
                  onClick={() => setSelectedDate(day)}
                  className={`shrink-0 rounded-xl px-4 py-3 border text-left transition-all ${selected ? 'border-gold bg-gold/10' : 'border-white/10 bg-dark-surface hover:border-gold/25'}`}
                >
                  <p className="text-sm text-text-primary font-medium">{day.weekDay}</p>
                  <p className="text-xs text-text-secondary mt-1">{day.label}</p>
                </button>
              );
            })}
          </div>

          {loadingSlots ? (
            <p className="text-text-secondary">Chargement des disponibilites...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {slots.map((slot) => {
                const selected = selectedSlot?.start_time === slot.start_time;
                return (
                  <button
                    type="button"
                    key={`${slot.start_time}-${slot.end_time}`}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border p-3 text-left transition-all ${!slot.available ? 'border-white/5 bg-dark-surface/40 text-text-muted cursor-not-allowed' : selected ? 'border-gold bg-gold/10' : 'border-white/10 bg-dark-surface hover:border-gold/25'}`}
                  >
                    <p className="text-sm font-semibold">{slot.start_time}</p>
                    <p className="text-xs text-text-secondary mt-1">Fin {slot.end_time}</p>
                    <p className="text-xs mt-2">{slot.available ? 'Disponible' : 'Complet'}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (successId) {
      return (
        <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 mx-auto mb-3 flex items-center justify-center">
            <Check className="w-6 h-6 text-emerald-300" />
          </div>
          <h3 className="text-xl font-bold text-text-primary">Reservation confirmee</h3>
          <p className="text-text-secondary mt-2">Numero: {successId}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-5 px-5 py-2.5 rounded-xl bg-gold text-dark font-semibold hover:bg-gold-light"
          >
            Retour au salon
          </button>
        </div>
      );
    }

    const assignmentRows = selectedServices.map((service) => ({
      service,
      barber: selectedBarbers[service.id],
    }));

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-dark-surface p-4">
          <p className="text-text-primary font-semibold mb-3">Recapitulatif</p>
          <div className="space-y-3 text-sm">
            {assignmentRows.map(({ service, barber }) => (
              <div key={service.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-text-primary">{service.name}</p>
                  <p className="text-text-muted">Coiffeur: {barber?.name ?? 'Auto'}</p>
                </div>
                <p className="text-gold font-semibold">{formatPrice(service.price)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-text-secondary">Total</span>
            <span className="text-gold font-bold text-lg">{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-2 text-text-secondary text-sm flex items-center gap-3">
            <span>{selectedDate.ymd}</span>
            <span>•</span>
            <span>{selectedSlot?.start_time}</span>
            <span>•</span>
            <span>{formatDuration(totalDuration)}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={() => void confirmBooking()}
          className="w-full py-3.5 rounded-xl bg-gold text-dark font-bold hover:bg-gold-light disabled:opacity-70"
        >
          {submitting ? 'Confirmation en cours...' : 'Confirmer la reservation'}
        </button>

        {apiError && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {apiError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(195,156,86,0.15),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(245,158,11,0.12),transparent_40%),#0B0B0F] text-white pb-14">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center justify-between mb-7">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <p className="text-text-muted text-sm">Salon: {salonName}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-dark-surface/80 backdrop-blur-md p-5 sm:p-7 shadow-2xl shadow-black/35">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8">
            {STEPS.map((label, index) => {
              const isCurrent = index === step;
              const isDone = index < step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center border ${isDone ? 'bg-gold border-gold text-dark' : isCurrent ? 'border-gold text-gold bg-gold/10' : 'border-white/20 text-text-muted'}`}
                  >
                    {isDone ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`${isCurrent ? 'text-text-primary' : 'text-text-muted'} text-sm`}>{label}</span>
                  {index < STEPS.length - 1 && <div className="w-4 h-px bg-white/20" />}
                </div>
              );
            })}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center gap-3">
              {step === 0 && <Scissors className="w-5 h-5 text-gold" />}
              {step === 1 && <UserRound className="w-5 h-5 text-gold" />}
              {step === 2 && <Clock3 className="w-5 h-5 text-gold" />}
              {step >= 3 && <Calendar className="w-5 h-5 text-gold" />}
              <h1 className="text-2xl font-bold text-text-primary">{STEPS[step]}</h1>
            </div>
            {stepContent()}
          </motion.div>

          {!successId && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (step === 0) {
                    navigate(-1);
                    return;
                  }
                  setStep((prev) => Math.max(0, prev - 1));
                }}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-text-secondary hover:text-text-primary hover:border-gold/40"
              >
                Precedent
              </button>

              {step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                  disabled={!canContinue()}
                  className="px-5 py-2.5 rounded-xl bg-gold text-dark font-semibold hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
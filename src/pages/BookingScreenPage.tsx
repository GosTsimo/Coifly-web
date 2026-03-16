import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowLeft, Calendar, Check, CheckCircle2, Clock3, Loader2, Scissors, Sparkles, Star, Timer, UserRound } from 'lucide-react';
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
        return (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {services.map((service) => {
            const selected = selectedServiceIds.includes(service.id);
            return (
              <button
                type="button"
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-all duration-200 group ${
                  selected
                    ? 'border-gold bg-gradient-to-r from-gold/15 to-amber-500/10 shadow-lg shadow-gold/15'
                    : 'border-white/10 bg-dark-surface hover:border-gold/40 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    selected ? 'bg-gold text-dark' : 'bg-white/5 text-text-secondary group-hover:bg-gold/10 group-hover:text-gold'
                  }`}>
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${selected ? 'text-text-primary' : 'text-text-primary'}`}>{service.name}</p>
                    {service.description && (
                      <p className="text-text-muted text-xs mt-0.5 line-clamp-1">{service.description}</p>
                    )}
                    <span className="inline-block mt-1.5 text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 text-text-muted">
                      {service.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold text-base ${selected ? 'text-gold' : 'text-text-primary'}`}>{formatPrice(service.price)}</p>
                    <p className="text-text-muted text-xs mt-0.5 inline-flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {formatDuration(service.duration)}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                    selected ? 'bg-gold border-gold' : 'border-white/20'
                  }`}>
                    {selected && <Check className="w-3 h-3 text-dark" strokeWidth={3} />}
                  </div>
                </div>
              </button>
            );
          })}

          {selectedServices.length > 0 && (
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/15 to-amber-500/10 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gold/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <p className="text-text-primary font-semibold text-sm">{selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} selectionne{selectedServices.length > 1 ? 's' : ''}</p>
                    <p className="text-text-muted text-xs inline-flex items-center gap-1"><Timer className="w-3 h-3" />{formatDuration(totalDuration)}</p>
                  </div>
                </div>
                <p className="text-gold font-bold text-lg">{formatPrice(totalPrice)}</p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step === 1) {
      if (loadingBarbers) {
        return (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-5">
          {selectedServices.map((service) => {
            const options = getBarbersForService(service.id);
            const selected = selectedBarbers[service.id];

            return (
              <section key={service.id} className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-white/10 bg-white/3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-gold" />
                    <p className="text-text-primary font-semibold text-sm">{service.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => autoAssignBarber(service.id)}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Automatique
                  </button>
                </div>

                <div className="p-4">
                  {options.length === 0 ? (
                    <p className="text-text-muted text-sm text-center py-3">Aucun coiffeur disponible pour ce service.</p>
                  ) : (
                    <div className="space-y-2">
                      {options.map((barber) => {
                        const isSelected = selected?.id === barber.id;
                        return (
                          <button
                            type="button"
                            key={barber.id}
                            onClick={() => setSelectedBarbers((prev) => ({ ...prev, [service.id]: barber }))}
                            className={`w-full text-left rounded-xl border p-3 transition-all duration-200 ${
                              isSelected
                                ? 'border-gold bg-gradient-to-r from-gold/15 to-amber-500/10'
                                : 'border-white/10 hover:border-gold/30 hover:bg-white/5'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {barber.photo_url ? (
                                <img src={barber.photo_url} alt={barber.name} className={`w-12 h-12 rounded-full object-cover border-2 transition-colors ${isSelected ? 'border-gold' : 'border-white/10'}`} />
                              ) : (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 transition-colors ${isSelected ? 'bg-gold/20 border-gold text-gold' : 'bg-white/10 border-white/10 text-text-secondary'}`}>
                                  {barber.name.charAt(0)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-text-primary font-semibold text-sm">{barber.name}</p>
                                <p className="text-text-muted text-xs mt-0.5">{barber.speciality}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 fill-gold text-gold" />
                                  <span className="text-gold text-xs font-medium">{barber.rating_average.toFixed(1)}</span>
                                  <span className="text-text-muted text-xs">({barber.reviews_count})</span>
                                </div>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                isSelected ? 'bg-gold border-gold' : 'border-white/20'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-dark" strokeWidth={3} />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          {/* Date strip */}
          <div>
            <p className="text-text-muted text-xs uppercase tracking-widest mb-3">Choisissez une date</p>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
              {nextDays.map((day) => {
                const selected = day.ymd === selectedDate.ymd;
                const isToday = day.weekDay === "Aujourd'hui";
                return (
                  <button
                    type="button"
                    key={day.ymd}
                    onClick={() => setSelectedDate(day)}
                    className={`shrink-0 rounded-2xl px-4 py-3.5 border text-center transition-all duration-200 min-w-[72px] ${
                      selected
                        ? 'border-gold bg-gradient-to-b from-gold/20 to-gold/10 shadow-lg shadow-gold/20'
                        : 'border-white/10 bg-dark-surface hover:border-gold/30 hover:bg-white/5'
                    }`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide ${
                      selected ? 'text-gold' : isToday ? 'text-emerald-400' : 'text-text-muted'
                    }`}>{day.weekDay}</p>
                    <p className={`text-sm font-bold mt-1 ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>{day.label}</p>
                    {selected && <div className="w-1.5 h-1.5 rounded-full bg-gold mx-auto mt-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          <div>
            <p className="text-text-muted text-xs uppercase tracking-widest mb-3">Creneaux disponibles</p>
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-dark-surface p-6 text-center">
                <Clock3 className="w-8 h-8 text-text-muted mx-auto mb-2" />
                <p className="text-text-secondary">Aucun creneau disponible ce jour.</p>
                <p className="text-text-muted text-sm mt-1">Essayez une autre date.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map((slot) => {
                  const selected = selectedSlot?.start_time === slot.start_time;
                  return (
                    <button
                      type="button"
                      key={`${slot.start_time}-${slot.end_time}`}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-xl border py-3 px-2 text-center transition-all duration-200 ${
                        !slot.available
                          ? 'border-white/5 bg-dark-surface/40 opacity-40 cursor-not-allowed'
                          : selected
                            ? 'border-gold bg-gradient-to-b from-gold/20 to-gold/10 shadow-gold/20 shadow-md'
                            : 'border-white/10 bg-dark-surface hover:border-gold/40 hover:bg-white/5'
                      }`}
                    >
                      <p className={`text-sm font-bold ${selected ? 'text-gold' : 'text-text-primary'}`}>{slot.start_time}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{slot.end_time}</p>
                      {!slot.available && <p className="text-[10px] text-text-muted mt-1">Complet</p>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (successId) {
      return (
        <div className="text-center py-4">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-text-primary">Reservation confirmee&nbsp;!</h3>
          <p className="text-text-muted mt-1 text-sm">Votre rendez-vous a ete enregistre avec succes.</p>
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 inline-block">
            <p className="text-text-secondary text-xs uppercase tracking-widest">Numero de reservation</p>
            <p className="text-emerald-300 font-bold text-lg mt-1">{successId}</p>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-dark font-bold hover:shadow-lg hover:shadow-gold/30 transition-all"
            >
              Retour au salon
            </button>
          </div>
        </div>
      );
    }

    const assignmentRows = selectedServices.map((service) => ({
      service,
      barber: selectedBarbers[service.id],
    }));

    return (
      <div className="space-y-4">
        {/* Receipt card */}
        <div className="rounded-2xl border border-white/10 bg-dark-surface overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/10 bg-white/3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold" />
            <p className="text-text-primary font-semibold text-sm">Recapitulatif</p>
          </div>
          <div className="p-4 divide-y divide-white/5">
            {assignmentRows.map(({ service, barber }) => (
              <div key={service.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Scissors className="w-3.5 h-3.5 text-gold" />
                  </div>
                  <div>
                    <p className="text-text-primary text-sm font-medium">{service.name}</p>
                    <p className="text-text-muted text-xs">Coiffeur: {barber?.name ?? 'Aleatoire'}</p>
                  </div>
                </div>
                <p className="text-gold font-bold text-sm shrink-0">{formatPrice(service.price)}</p>
              </div>
            ))}
          </div>
          <div className="px-5 py-4 border-t border-gold/20 bg-gold/5 flex items-center justify-between">
            <span className="text-text-secondary font-medium">Total</span>
            <span className="text-gold font-extrabold text-xl">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        {/* Date/time/duration row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-white/10 bg-dark-surface p-3 text-center">
            <Calendar className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wide text-text-muted">Date</p>
            <p className="text-text-primary text-xs font-semibold mt-0.5">{selectedDate.label}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-dark-surface p-3 text-center">
            <Clock3 className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wide text-text-muted">Heure</p>
            <p className="text-text-primary text-xs font-semibold mt-0.5">{selectedSlot?.start_time}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-dark-surface p-3 text-center">
            <Timer className="w-4 h-4 text-gold mx-auto mb-1" />
            <p className="text-[10px] uppercase tracking-wide text-text-muted">Duree</p>
            <p className="text-text-primary text-xs font-semibold mt-0.5">{formatDuration(totalDuration)}</p>
          </div>
        </div>

        <button
          type="button"
          disabled={submitting}
          onClick={() => void confirmBooking()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold to-amber-500 text-dark font-extrabold text-base hover:shadow-xl hover:shadow-gold/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Confirmation en cours...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" />Confirmer la reservation</>
          )}
        </button>

        {apiError && (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {apiError}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_10%,rgba(195,156,86,0.15),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(245,158,11,0.12),transparent_40%),#0B0B0F] text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-gold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <div className="text-right">
            <p className="text-xs text-text-muted">Salon</p>
            <p className="text-sm font-semibold text-text-primary">{salonName}</p>
          </div>
        </div>

        {/* Step indicator */}
        {!successId && (
          <div className="flex items-center mb-8">
            {STEPS.map((label, index) => {
              const isCurrent = index === step;
              const isDone = index < step;
              return (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center border-2 transition-all duration-300 ${
                      isDone ? 'bg-gold border-gold text-dark' : isCurrent ? 'border-gold text-gold bg-gold/10 shadow-md shadow-gold/30' : 'border-white/15 text-text-muted bg-white/5'
                    }`}>
                      {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : index + 1}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${
                      isCurrent ? 'text-gold' : isDone ? 'text-text-secondary' : 'text-text-muted'
                    }`}>{label}</span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all duration-500 ${
                      isDone ? 'bg-gold' : 'bg-white/10'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Card */}
        <div className="rounded-3xl border border-white/10 bg-dark-surface/80 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          {!successId && (
            <div className="px-5 sm:px-7 pt-6 pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                  {step === 0 && <Scissors className="w-5 h-5 text-gold" />}
                  {step === 1 && <UserRound className="w-5 h-5 text-gold" />}
                  {step === 2 && <Clock3 className="w-5 h-5 text-gold" />}
                  {step === 3 && <Calendar className="w-5 h-5 text-gold" />}
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-text-primary">{STEPS[step]}</h1>
                  <p className="text-text-muted text-xs">Etape {step + 1} sur {STEPS.length}</p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-7"
            >
              {stepContent()}
            </motion.div>
          </AnimatePresence>

          {!successId && (
            <div className="px-5 sm:px-7 pb-6 flex items-center justify-between gap-3 border-t border-white/8 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (step === 0) { navigate(-1); return; }
                  setStep((prev) => Math.max(0, prev - 1));
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/15 text-text-secondary hover:text-text-primary hover:border-gold/30 transition-all text-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Precedent
              </button>

              {step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep((prev) => Math.min(3, prev + 1))}
                  disabled={!canContinue()}
                  className="flex-1 max-w-xs py-3 rounded-xl bg-gradient-to-r from-gold to-amber-500 text-dark font-bold hover:shadow-lg hover:shadow-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
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
import { useEffect, useMemo, useState } from 'react';
import { X, Calendar, Clock, Check, ChevronLeft, Scissors, Home, User, Phone, MessageSquare, UserPlus, Cake } from 'lucide-react';
import { useLang } from '@/LanguageContext';
import { useData } from '@/DataContext';
import {
  SERVICE_CORTE,
  SERVICE_DOMICILIO,
  SERVICE_LABEL,
  SERVICE_PRICE,
  LOCATION_LABEL,
  type Slot,
} from '@/lib/supabase';

type Props = {
  open: boolean;
  initialService?: string;
  onClose: () => void;
};

const fmtDate = (iso: string, lang: string) => {
  const d = new Date(`${iso}T00:00:00`);
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'es' ? 'es-ES' : 'en-GB';
  return d.toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export default function BookingModal({ open, initialService, onClose }: Props) {
  const { t, lang } = useLang();
  const { slots, createBooking } = useData();
  const [step, setStep] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [service, setService] = useState<string>(initialService ?? SERVICE_CORTE);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [referredByPhone, setReferredByPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [nameError, setNameError] = useState('');
  const [takenError, setTakenError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedSlot(null);
      setService(initialService ?? SERVICE_CORTE);
      setName('');
      setPhone('');
      setNote('');
      setReferredByPhone('');
      setBirthday('');
      setDone(false);
      setNameError('');
      setTakenError(false);
    }
  }, [open, initialService]);

  const availableSlots = useMemo(
    () => slots.filter((s) => !s.booked),
    [slots]
  );

  const fullNameValid = useMemo(() => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return parts.length >= 2 && parts.every((part) => part.length >= 2);
  }, [name]);

  const isBirthdayPromo = useMemo(() => {
    if (!birthday || !selectedSlot || service !== SERVICE_CORTE) return false;
    const [, month, day] = birthday.split('-');
    const [slotYear, slotMonth, slotDay] = selectedSlot.date.split('-');
    return month === slotMonth && day === slotDay;
  }, [birthday, selectedSlot, service]);

  const effectivePrice = isBirthdayPromo ? 3 : SERVICE_PRICE[service];

  if (!open) return null;

  const confirm = async () => {
    if (!selectedSlot || !fullNameValid || !phone.trim()) return;
    setSubmitting(true);
    setTakenError(false);
    try {
      const result = await createBooking(selectedSlot.id, name.trim(), phone.trim(), service, note, referredByPhone, birthday);
      if (result.ok) {
        setDone(true);
      } else if (result.reason === 'taken') {
        setTakenError(true);
        setStep(1);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="industrial-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-ink-400/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-ink-500/40 sticky top-0 bg-ink-800 z-10">
          <h3 className="font-display font-700 uppercase text-lg tracking-wide flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brick-500" />
            {t('booking.title')}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-ink-600 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-brick-500/15 border-2 border-brick-500 flex items-center justify-center mx-auto mb-5 animate-pulse-glow">
              <Check className="w-8 h-8 text-brick-500" />
            </div>
            <h4 className="font-display font-700 uppercase text-xl mb-2">
              {t('booking.success')}
            </h4>
            <p className="text-white/70 text-sm mb-6">{t('booking.successDesc')}</p>
            <div className="industrial-card rounded-lg p-4 text-left text-sm space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-white/50">{t('booking.service')}</span>
                <span className="text-white font-medium">
                  {SERVICE_LABEL[service]?.[lang]} · {effectivePrice}€
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{t('booking.date')}</span>
                <span className="text-white font-medium">
                  {selectedSlot ? fmtDate(selectedSlot.date, lang) : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">{t('booking.time')}</span>
                <span className="text-white font-medium">
                  {selectedSlot?.time.slice(0, 5)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full px-5 py-3 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-colors"
            >
              {t('booking.close')}
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="flex items-center gap-2 mb-6">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex-1 flex items-center gap-2">
                  <div
                    className={`flex-1 h-1 rounded-full ${
                      step >= s ? 'bg-brick-500' : 'bg-ink-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            {step === 1 && (
              <div>
                <p className="text-sm uppercase tracking-wide text-white/60 mb-3">
                  {t('booking.step1')}
                </p>
                {availableSlots.length === 0 ? (
                  <div className="industrial-card rounded-lg p-6 text-center text-white/50 text-sm">
                    {t('booking.noSlots')}
                  </div>
                ) : (
                  <>
                    {takenError && (
                      <div className="mb-3 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                        {t('booking.taken')}
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {availableSlots.map((s) => {
                      const active = selectedSlot?.id === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-3 rounded-lg border text-center transition-all ${
                            active
                              ? 'bg-brick-500 border-brick-500 text-white'
                              : 'bg-ink-700/60 border-ink-400/50 text-white/80 hover:border-brick-500/60'
                          }`}
                        >
                          <div className="text-xs uppercase tracking-wide opacity-80">
                            {fmtDate(s.date, lang)}
                          </div>
                          <div className="font-display font-600 text-lg mt-0.5">
                            {s.time.slice(0, 5)}
                          </div>
                          <div className={`mt-1.5 inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${
                            s.location === 'blanes'
                              ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                              : 'bg-brick-500/15 text-brick-300 border border-brick-500/30'
                          }`}>
                            {LOCATION_LABEL[s.location]?.[lang]}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  </>
                )}
                <div className="flex justify-end mt-5">
                  <button
                    disabled={!selectedSlot}
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 bg-brick-500 disabled:bg-ink-600 disabled:text-white/40 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-colors"
                  >
                    {t('booking.confirm').split(' ')[0]} →
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-white/60 hover:text-brick-400 mb-4"
                >
                  <ChevronLeft className="w-4 h-4" /> {t('booking.back')}
                </button>
                <p className="text-sm uppercase tracking-wide text-white/60 mb-3">
                  {t('booking.step2')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: SERVICE_CORTE, icon: Scissors, label: SERVICE_LABEL[SERVICE_CORTE][lang], price: 7 },
                    { key: SERVICE_DOMICILIO, icon: Home, label: SERVICE_LABEL[SERVICE_DOMICILIO][lang], price: 11 },
                  ].map((s) => {
                    const Icon = s.icon;
                    const active = service === s.key;
                    return (
                      <button
                        key={s.key}
                        onClick={() => setService(s.key)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          active
                            ? 'bg-brick-500/15 border-brick-500'
                            : 'bg-ink-700/60 border-ink-400/50 hover:border-brick-500/50'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${active ? 'text-brick-400' : 'text-white/70'}`} />
                        <div className="font-display font-600 uppercase text-sm">{s.label}</div>
                        <div className="text-lg font-bold text-brick-400 mt-1">{s.price}€</div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end mt-5">
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-colors"
                  >
                    →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1 text-sm text-white/60 hover:text-brick-400 mb-4"
                >
                  <ChevronLeft className="w-4 h-4" /> {t('booking.back')}
                </button>
                <p className="text-sm uppercase tracking-wide text-white/60 mb-3">
                  {t('booking.step3')}
                </p>

                <div className="space-y-3">
                  <div className="relative">
                    <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError('');
                      }}
                      onBlur={() => {
                        if (name.trim() && !fullNameValid) setNameError('fullNameRequired');
                      }}
                      placeholder={t('booking.name')}
                      className={`w-full bg-ink-700/60 border rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none ${
                        nameError ? 'border-red-500/70' : 'border-ink-400/60 focus:border-brick-500'
                      }`}
                    />
                  </div>
                  {nameError && (
                    <p className="text-xs text-red-300 -mt-1">
                      {t('booking.nameRequired')}
                    </p>
                  )}
                  <div className="relative">
                    <Phone className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t('booking.phone')}
                      inputMode="tel"
                      className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500"
                    />
                  </div>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t('booking.notePlaceholder')}
                      rows={2}
                      className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500 resize-none"
                    />
                  </div>
                  <div className="relative">
                    <UserPlus className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={referredByPhone}
                      onChange={(e) => setReferredByPhone(e.target.value)}
                      placeholder={t('booking.referredBy')}
                      inputMode="tel"
                      className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500"
                    />
                  </div>
                  <div className="relative">
                    <Cake className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={birthday}
                      onChange={(e) => setBirthday(e.target.value)}
                      placeholder={t('booking.birthday')}
                      className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md pl-10 pr-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500"
                    />
                  </div>
                  {isBirthdayPromo && (
                    <p className="text-xs text-brick-300 bg-brick-500/10 border border-brick-500/30 rounded-md px-3 py-2">
                      {t('services.promotionBirthday')}
                    </p>
                  )}
                </div>

                <div className="industrial-card rounded-lg p-4 mt-5 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/50">{t('booking.service')}</span>
                    <span className="text-white">
                      {SERVICE_LABEL[service]?.[lang]} · {effectivePrice}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">{t('booking.date')}</span>
                    <span className="text-white">
                      {selectedSlot ? fmtDate(selectedSlot.date, lang) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">{t('booking.time')}</span>
                    <span className="text-white flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {selectedSlot?.time.slice(0, 5)}
                    </span>
                  </div>
                  {selectedSlot && (
                    <div className="flex justify-between">
                      <span className="text-white/50">{t('booking.location')}</span>
                      <span className="text-white">
                        {LOCATION_LABEL[selectedSlot.location]?.[lang]}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-white/50 mt-4 leading-relaxed">
                  {t('booking.cancelNotice')}
                </p>

                <button
                  disabled={!fullNameValid || !phone.trim() || submitting}
                  onClick={confirm}
                  className="w-full mt-5 px-5 py-3.5 bg-brick-500 disabled:bg-ink-600 disabled:text-white/40 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? '...' : (
                    <>
                      <Check className="w-4 h-4" />
                      {t('booking.confirm')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useMemo, useState } from 'react';
import {
  X, Lock, LogOut, Plus, Trash2, Calendar, Clock, Check, Scissors, Home, Lock as LockIcon, Image as ImageIcon, ImagePlus, Cake,
} from 'lucide-react';
import { useLang } from '@/LanguageContext';
import { useData } from '@/DataContext';
import { SERVICE_LABEL, SERVICE_PRICE, LOCATION_LABEL, WEEKDAY_TIMES, WEEKEND_MORNING_TIMES, SUNDAY_EVENING_TIMES, locationForSlot } from '@/lib/supabase';

type Props = { open: boolean; onClose: () => void };

const fmtDate = (iso: string, lang: string) => {
  const d = new Date(`${iso}T00:00:00`);
  const locale = lang === 'ca' ? 'ca-ES' : lang === 'es' ? 'es-ES' : 'en-GB';
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
};

export default function AdminPanel({ open, onClose }: Props) {
  const { t, lang } = useLang();
  const { isAdmin, login, logout, slots, bookings, photos, addSlot, deleteSlot, deleteBooking, verifyBirthday, addPhotos, deletePhoto } = useData();
  const [pass, setPass] = useState('');
  const [err, setErr] = useState(false);
  const [tab, setTab] = useState<'slots' | 'bookings' | 'gallery' | 'promotions'>('slots');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slotLocation, setSlotLocation] = useState<'bcn' | 'blanes'>('bcn');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoCaption, setPhotoCaption] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const FRIDAY_TIMES = WEEKDAY_TIMES;

  const bookingBySlotId = useMemo(() => {
    const map = new Map<string, typeof bookings[number]>();
    for (const b of bookings) map.set(b.slot_id, b);
    return map;
  }, [bookings]);

  const schedulePresets = [
    { label: t('admin.presetWeekday'), times: WEEKDAY_TIMES, days: [1, 2, 3, 4] },
    { label: t('admin.presetFridayBcn'), times: FRIDAY_TIMES, days: [5], location: 'bcn' as const },
    { label: t('admin.presetFridayBlanes'), times: FRIDAY_TIMES, days: [5], location: 'blanes' as const },
    { label: t('admin.presetSaturday'), times: WEEKEND_MORNING_TIMES, days: [6], location: 'blanes' as const },
    { label: t('admin.presetSundayBlanes'), times: WEEKEND_MORNING_TIMES, days: [0], location: 'blanes' as const },
    { label: t('admin.presetSundayBcn'), times: SUNDAY_EVENING_TIMES, days: [0], location: 'bcn' as const },
  ];

  const toIsoDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNextDate = (days: number[]) => {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    for (let offset = 0; offset <= 7; offset++) {
      const candidate = new Date(base);
      candidate.setDate(base.getDate() + offset);
      if (days.includes(candidate.getDay())) return toIsoDate(candidate);
    }
    return toIsoDate(base);
  };

  const addPreset = async (times: string[], days: number[], location?: 'bcn' | 'blanes') => {
    const targetDate = getNextDate(days);
    const existingTimes = new Set(
      slots
        .filter((slot) => slot.date === targetDate && (!location || slot.location === location))
        .map((slot) => slot.time.slice(0, 5))
    );
    for (const presetTime of times) {
      const presetLocation = location ?? locationForSlot(targetDate, presetTime);
      const key = `${presetTime}-${presetLocation}`;
      if (!existingTimes.has(key)) {
        await addSlot(targetDate, presetTime, presetLocation);
        existingTimes.add(key);
      }
    }
  };

  const promotionCustomers = useMemo(() => {
    const customers = new Map<string, { name: string; phone: string; visits: number; referrals: Set<string> }>();
    for (const booking of bookings) {
      const phone = booking.client_phone.replace(/\D/g, '');
      if (!phone) continue;
      const customer = customers.get(phone) ?? {
        name: booking.client_name,
        phone: booking.client_phone,
        visits: 0,
        referrals: new Set<string>(),
      };
      if (booking.service_type === 'corte') customer.visits += 1;
      const referrer = booking.referred_by_phone?.replace(/\D/g, '');
      if (referrer && referrer !== phone) {
        const referredPhone = phone;
        const referrerCustomer = customers.get(referrer) ?? {
          name: booking.referred_by_phone ?? referrer,
          phone: booking.referred_by_phone ?? referrer,
          visits: 0,
          referrals: new Set<string>(),
        };
        referrerCustomer.referrals.add(referredPhone);
        customers.set(referrer, referrerCustomer);
      }
      customers.set(phone, customer);
    }
    return Array.from(customers.values()).sort((a, b) => (b.visits + b.referrals.size) - (a.visits + a.referrals.size));
  }, [bookings]);

  const addFullWeek = async () => {
    const base = date ? new Date(`${date}T12:00:00`) : new Date();
    const dayOfWeek = base.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(base);
    monday.setDate(base.getDate() + diff);
    for (let offset = 0; offset < 7; offset++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + offset);
      const iso = toIsoDate(d);
      const dow = d.getDay();
      const blocks: { times: string[]; location: 'bcn' | 'blanes' }[] = [];
      if (dow >= 1 && dow <= 4) blocks.push({ times: WEEKDAY_TIMES, location: 'bcn' });
      else if (dow === 5) blocks.push({ times: WEEKDAY_TIMES, location: 'bcn' }, { times: WEEKDAY_TIMES, location: 'blanes' });
      else if (dow === 6) blocks.push({ times: WEEKEND_MORNING_TIMES, location: 'blanes' });
      else if (dow === 0) blocks.push({ times: WEEKEND_MORNING_TIMES, location: 'blanes' }, { times: SUNDAY_EVENING_TIMES, location: 'bcn' });

      for (const block of blocks) {
        const existingTimes = new Set(
          slots.filter((slot) => slot.date === iso && slot.location === block.location).map((slot) => slot.time.slice(0, 5))
        );
        for (const presetTime of block.times) {
          if (!existingTimes.has(presetTime)) {
            await addSlot(iso, presetTime, block.location);
            existingTimes.add(presetTime);
          }
        }
      }
    }
  };

  if (!open) return null;

  const handleLogin = () => {
    if (login(pass)) {
      setPass('');
      setErr(false);
    } else {
      setErr(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink-900/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="industrial-card rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto border border-ink-400/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-ink-500/40 sticky top-0 bg-ink-800 z-10">
          <h3 className="font-display font-700 uppercase text-lg tracking-wide flex items-center gap-2">
            <LockIcon className="w-5 h-5 text-brick-500" />
            {t('admin.title')}
          </h3>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-brick-400 px-3 py-1.5 rounded-md hover:bg-ink-700 transition-colors"
              >
                <LogOut className="w-4 h-4" /> {t('admin.logout')}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-ink-600 flex items-center justify-center text-white/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isAdmin ? (
          <div className="p-10 max-w-sm mx-auto text-center">
            <div className="w-14 h-14 rounded-full bg-brick-500/15 border border-brick-500/30 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-7 h-7 text-brick-500" />
            </div>
            <h4 className="font-display font-600 uppercase text-lg mb-4">{t('admin.login')}</h4>
            <input
              type="password"
              value={pass}
              onChange={(e) => {
                setPass(e.target.value);
                setErr(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder={t('admin.password')}
              className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500 text-center"
            />
            {err && <p className="text-brick-400 text-xs mt-2">{t('admin.wrongPass')}</p>}
            <button
              onClick={handleLogin}
              className="w-full mt-4 px-5 py-3 bg-brick-500 hover:bg-brick-400 text-white font-display font-600 uppercase tracking-wider text-sm rounded-md transition-colors"
            >
              {t('admin.enter')}
            </button>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-white/60 text-sm mb-5">{t('admin.subtitle')}</p>

            <div className="flex gap-1 mb-5 bg-ink-700/60 p-1 rounded-lg w-fit">
              {(['slots', 'bookings', 'gallery', 'promotions'] as const).map((tk) => (
                <button
                  key={tk}
                  onClick={() => setTab(tk)}
                  className={`px-4 py-2 text-sm font-display font-600 uppercase tracking-wide rounded-md transition-all ${
                    tab === tk
                      ? 'bg-brick-500 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {t(`admin.tab${tk.charAt(0).toUpperCase()}${tk.slice(1)}`)}
                </button>
              ))}
            </div>

            {tab === 'slots' && (
              <div>
                <div className="industrial-card rounded-lg p-4 mb-5">
                  <p className="text-xs uppercase tracking-wide text-white/60 mb-3">{t('admin.addSlot')}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        if (e.target.value && time) setSlotLocation(locationForSlot(e.target.value, time));
                      }}
                      className="flex-1 bg-ink-700/60 border border-ink-400/60 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brick-500"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        if (date && e.target.value) setSlotLocation(locationForSlot(date, e.target.value));
                      }}
                      className="flex-1 bg-ink-700/60 border border-ink-400/60 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brick-500"
                    />
                    <select
                      value={slotLocation}
                      onChange={(e) => setSlotLocation(e.target.value as 'bcn' | 'blanes')}
                      className="flex-1 bg-ink-700/60 border border-ink-400/60 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brick-500"
                    >
                      <option value="bcn">{LOCATION_LABEL.bcn[lang]}</option>
                      <option value="blanes">{LOCATION_LABEL.blanes[lang]}</option>
                    </select>
                    <button
                      onClick={async () => {
                        if (date && time) {
                          await addSlot(date, time, slotLocation);
                          setDate('');
                          setTime('');
                        }
                      }}
                      disabled={!date || !time}
                      className="px-4 py-2.5 bg-brick-500 disabled:bg-ink-600 disabled:text-white/40 hover:bg-brick-400 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> {t('admin.addSlotBtn')}
                    </button>
                  </div>
                  <div className="mt-4 pt-4 border-t border-ink-400/30">
                    <p className="text-xs uppercase tracking-wide text-white/60 mb-1">
                      {t('admin.presetSchedule')}
                    </p>
                    <p className="text-xs text-white/40 mb-3">{t('admin.presetHint')}</p>
                    <div className="grid sm:grid-cols-3 gap-2">
                      {schedulePresets.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => addPreset(preset.times, preset.days, preset.location)}
                          className="px-3 py-2.5 bg-ink-700/70 hover:bg-brick-500 border border-ink-400/50 hover:border-brick-500 text-white text-xs font-medium rounded-md transition-colors"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={addFullWeek}
                      className="mt-2 w-full px-3 py-2.5 bg-brick-500/15 hover:bg-brick-500 border border-brick-500/40 text-brick-300 hover:text-white text-xs font-semibold rounded-md transition-colors"
                    >
                      {t('admin.presetFullWeek')}
                    </button>
                  </div>
                </div>

                {slots.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">{t('admin.noSlots')}</p>
                ) : (
                  <div className="space-y-2">
                    {slots.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 bg-ink-700/40 rounded-lg border border-ink-400/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-ink-700 border border-ink-400/50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-brick-500" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white capitalize">
                              {fmtDate(s.date, lang)}
                            </div>
                            <div className="text-xs text-white/50 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {s.time.slice(0, 5)} · {LOCATION_LABEL[s.location]?.[lang]}
                            </div>
                            {s.booked && bookingBySlotId.get(s.id) && (
                              <div className="text-xs text-brick-300 mt-1 flex items-center gap-1">
                                <span className="opacity-70">●</span>
                                <span className="font-medium text-white/90">{bookingBySlotId.get(s.id)?.client_name}</span>
                                <span className="text-white/40">· {bookingBySlotId.get(s.id)?.client_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              s.booked
                                ? 'bg-brick-500/20 text-brick-400 border border-brick-500/40'
                                : 'bg-green-500/15 text-green-400 border border-green-500/30'
                            }`}
                          >
                            {s.booked ? '●' : '○'}
                          </span>
                          <button
                            onClick={() => {
                              if (confirm(t('admin.confirmDelete'))) deleteSlot(s.id);
                            }}
                            className="w-8 h-8 rounded-md hover:bg-red-600/80 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'bookings' && (
              <div>
                {bookings.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">{t('admin.noBookings')}</p>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((b) => {
                      const slot = b.slot ?? slots.find((s) => s.id === b.slot_id);
                      const isHome = b.service_type === 'domicilio';
                      const isBirthdayPromo =
                        b.service_type === 'corte' &&
                        b.birthday &&
                        slot &&
                        b.birthday.slice(5) === slot.date.slice(5);
                      return (
                        <div
                          key={b.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-ink-700/40 rounded-lg border border-ink-400/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-md flex items-center justify-center shrink-0 ${
                                isHome
                                  ? 'bg-brick-500/15 border border-brick-500/30'
                                  : 'bg-ink-700 border border-ink-400/50'
                              }`}
                            >
                              {isHome ? (
                                <Home className="w-4 h-4 text-brick-400" />
                              ) : (
                                <Scissors className="w-4 h-4 text-brick-500" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {b.client_name}
                              </div>
                              <div className="text-xs text-white/50 truncate">
                                {b.client_phone}
                              </div>
                              {b.note && (
                                <div className="text-xs text-brick-300/80 mt-1 italic truncate">
                                  “{b.note}”
                                </div>
                              )}
                              {isBirthdayPromo && (
                                <div className="mt-1 inline-flex items-center gap-1 text-xs text-brick-300 bg-brick-500/10 border border-brick-500/30 rounded px-2 py-0.5">
                                  <Cake className="w-3 h-3" /> {t('admin.birthdayToday')}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 sm:gap-4 sm:shrink-0">
                            <div className="text-left sm:text-right text-xs">
                              <div className="text-white/80 capitalize">
                                {slot ? fmtDate(slot.date, lang) : ''}
                              </div>
                              <div className="text-white/50 flex items-center sm:justify-end gap-1">
                                <Clock className="w-3 h-3" /> {slot?.time.slice(0, 5)}
                              </div>
                              {slot && (
                                <div className="text-brick-300 mt-0.5">
                                  {LOCATION_LABEL[slot.location]?.[lang]}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-brick-400">
                                {SERVICE_LABEL[b.service_type]?.[lang]}
                              </div>
                              <div className="text-xs text-white/50">
                                {isBirthdayPromo ? '3€' : `${SERVICE_PRICE[b.service_type]}€`}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                if (confirm(t('admin.confirmDelete')))
                                  deleteBooking(b.id, b.slot_id);
                              }}
                              className="px-3 py-1.5 bg-ink-700 hover:bg-red-600/80 text-white/70 hover:text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> {t('admin.deleteBooking')}
                            </button>
                          </div>
                          {isBirthdayPromo && (
                            <button
                              onClick={() => verifyBirthday(b.id)}
                              disabled={b.birthday_verified ?? false}
                              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                                b.birthday_verified
                                  ? 'bg-green-600/20 text-green-400 border border-green-500/40'
                                  : 'bg-green-600/80 hover:bg-green-600 text-white'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              {b.birthday_verified ? t('admin.birthdayVerified') : t('admin.birthdayMarkVerified')}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'promotions' && (
              <div>
                {promotionCustomers.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-8">{t('admin.noPromotionData')}</p>
                ) : (
                  <div className="space-y-3">
                    {promotionCustomers.map((customer) => {
                      const loyaltyFreeCuts = Math.floor(customer.visits / 9);
                      const referralFreeCuts = Math.floor(customer.referrals.size / 2);
                      const visitsUntilReward = customer.visits % 9 === 0 ? 9 : 9 - (customer.visits % 9);
                      const referralsUntilReward = customer.referrals.size % 2 === 0 ? 2 : 2 - (customer.referrals.size % 2);
                      return (
                        <div key={customer.phone} className="industrial-card rounded-lg p-4 border border-ink-400/40">
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                              <p className="font-semibold text-white">{customer.name}</p>
                              <p className="text-xs text-white/50">{customer.phone}</p>
                            </div>
                            <div className="text-right text-xs text-brick-300">
                              {loyaltyFreeCuts + referralFreeCuts} {t('admin.freeCuts')}
                            </div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3 text-sm">
                            <div className="rounded-md bg-ink-700/50 p-3">
                              <p className="text-xs uppercase tracking-wide text-white/50 mb-1">{t('admin.promotionLoyalty')}</p>
                              <p className="text-white font-medium">{customer.visits} {t('admin.clientVisits')}</p>
                              <p className="text-xs text-white/50 mt-1">{t('admin.nextReward')} {visitsUntilReward} {t('admin.clientVisits')}</p>
                            </div>
                            <div className="rounded-md bg-ink-700/50 p-3">
                              <p className="text-xs uppercase tracking-wide text-white/50 mb-1">{t('admin.promotionReferral')}</p>
                              <p className="text-white font-medium">{customer.referrals.size} {t('admin.referrals')}</p>
                              <p className="text-xs text-white/50 mt-1">{t('admin.nextReward')} {referralsUntilReward} {t('admin.referrals')}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {tab === 'gallery' && (
              <div>
                <div className="industrial-card rounded-lg p-4 mb-5 space-y-3">
                  <p className="text-xs uppercase tracking-wide text-white/60">{t('admin.addPhoto')}</p>
                  <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brick-500/50 bg-ink-700/40 px-4 py-6 text-center transition-colors hover:border-brick-400 hover:bg-ink-700">
                    <ImagePlus className="h-8 w-8 text-brick-400" />
                    <span className="text-sm font-semibold text-white">{t('admin.choosePhotos')}</span>
                    <span className="text-xs text-white/45">{t('admin.choosePhotosHint')}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      multiple
                      onChange={(e) => {
                        setPhotoError('');
                        setPhotoFiles(Array.from(e.target.files ?? []));
                      }}
                      className="sr-only"
                    />
                  </label>
                  {photoFiles.length > 0 && (
                    <p className="text-xs text-brick-300">
                      {photoFiles.length} {t('admin.photosSelected')}
                    </p>
                  )}
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder={t('admin.photoCaption')}
                    className="w-full bg-ink-700/60 border border-ink-400/60 rounded-md px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-brick-500"
                  />
                  {photoError && <p className="text-xs text-red-300">{photoError}</p>}
                  <button
                    onClick={async () => {
                      const invalidFile = photoFiles.find(
                        (file) => !file.type.startsWith('image/') || file.size > 10 * 1024 * 1024
                      );
                      if (invalidFile) {
                        setPhotoError(t('admin.photoError'));
                        return;
                      }
                      if (photoFiles.length === 0) return;
                      setUploadingPhotos(true);
                      setPhotoError('');
                      try {
                        await addPhotos(photoFiles, photoCaption.trim());
                        setPhotoFiles([]);
                        setPhotoCaption('');
                      } catch {
                        setPhotoError(t('admin.photoUploadError'));
                      } finally {
                        setUploadingPhotos(false);
                      }
                    }}
                    disabled={photoFiles.length === 0 || uploadingPhotos}
                    className="w-full px-4 py-2.5 bg-brick-500 disabled:bg-ink-600 disabled:text-white/40 hover:bg-brick-400 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {uploadingPhotos ? t('admin.uploadingPhotos') : t('admin.addPhotoBtn')}
                  </button>
                </div>

                {photos.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-8 h-8 text-white/30 mx-auto mb-2" />
                    <p className="text-white/40 text-sm">{t('gallery.empty')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map((p) => (
                      <div
                        key={p.id}
                        className="group relative aspect-square rounded-md overflow-hidden border border-ink-400/40"
                      >
                        <img
                          src={p.image_url}
                          alt={p.caption ?? ''}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            if (confirm(t('admin.confirmDelete'))) deletePhoto(p);
                          }}
                          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-ink-900/80 hover:bg-red-600/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

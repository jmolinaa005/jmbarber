import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: { persistSession: false },
});

export type Slot = {
  id: string;
  date: string;
  time: string;
  booked: boolean;
  location: 'bcn' | 'blanes';
  created_at: string;
};

export const LOC_BCN = 'bcn';
export const LOC_BLANES = 'blanes';

export const LOCATION_LABEL: Record<string, Record<'ca' | 'es' | 'en', string>> = {
  bcn: { ca: 'Barcelona', es: 'Barcelona', en: 'Barcelona' },
  blanes: { ca: 'Blanes', es: 'Blanes', en: 'Blanes' },
};

/**
 * Decide the city for a given weekday + time based on JM Barber's schedule.
 * Mon-Thu: only Barcelona.
 * Fri: Barcelona or Blanes (defaults to Barcelona; admin overrides when needed).
 * Sat + Sun 11:00-13:30: Blanes.
 * Sun 18:00-20:30: Barcelona.
 */
export function locationForSlot(dateIso: string, time: string): 'bcn' | 'blanes' {
  const day = new Date(`${dateIso}T12:00:00`).getDay();
  const hour = Number(time.slice(0, 2));
  const minutes = Number(time.slice(3, 5));
  const decimal = hour + minutes / 60;

  if (day >= 1 && day <= 4) return 'bcn';
  if (day === 5) return 'bcn';
  if (day === 6) return 'blanes';
  if (day === 0) {
    if (decimal >= 11 && decimal <= 13.5) return 'blanes';
    if (decimal >= 18 && decimal <= 20.5) return 'bcn';
    return 'bcn';
  }
  return 'bcn';
}

export const WEEKDAY_TIMES = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
export const WEEKEND_MORNING_TIMES = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30'];
export const SUNDAY_EVENING_TIMES = ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'];

export type Booking = {
  id: string;
  slot_id: string;
  client_name: string;
  client_phone: string;
  service_type: string;
  note: string | null;
  referred_by_phone: string | null;
  birthday: string | null;
  birthday_verified: boolean | null;
  created_at: string;
  slot?: Slot;
};

export type GalleryPhoto = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export const SERVICE_CORTE = 'corte';
export const SERVICE_DOMICILIO = 'domicilio';

export const SERVICE_LABEL: Record<string, Record<'ca' | 'es' | 'en', string>> = {
  corte: { ca: 'Corte', es: 'Corte', en: 'Haircut' },
  domicilio: { ca: 'A Domicili', es: 'A Domicilio', en: 'At-Home' },
};

export const SERVICE_PRICE: Record<string, number> = {
  corte: 7,
  domicilio: 11,
};

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Slot, type Booking, type GalleryPhoto, locationForSlot } from './lib/supabase';

const ADMIN_PASSWORD = 'jmbarber2024';
const ADMIN_KEY = 'jm_barber_admin';

type Ctx = {
  slots: Slot[];
  bookings: Booking[];
  photos: GalleryPhoto[];
  loading: boolean;
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  refreshSlots: () => Promise<void>;
  refreshBookings: () => Promise<void>;
  refreshPhotos: () => Promise<void>;
  addSlot: (date: string, time: string, location?: 'bcn' | 'blanes') => Promise<void>;
  deleteSlot: (id: string) => Promise<void>;
  createBooking: (slotId: string, name: string, phone: string, service: string, note?: string, referredByPhone?: string, birthday?: string) => Promise<{ ok: boolean; reason?: 'taken' }>;
  verifyBirthday: (bookingId: string) => Promise<void>;
  deleteBooking: (id: string, slotId: string) => Promise<void>;
  addPhotos: (files: File[], caption: string) => Promise<void>;
  deletePhoto: (photo: GalleryPhoto) => Promise<void>;
};

const DataContext = createContext<Ctx | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return typeof localStorage !== 'undefined' && localStorage.getItem(ADMIN_KEY) === '1';
  });

  const login = useCallback((password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem(ADMIN_KEY, '1');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem(ADMIN_KEY);
  }, []);

  const refreshSlots = useCallback(async () => {
    const { data } = await supabase
      .from('slots')
      .select('*')
      .order('date', { ascending: true })
      .order('time', { ascending: true });
    setSlots((data as Slot[]) ?? []);
  }, []);

  const refreshBookings = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, slot:slots(*)')
      .order('created_at', { ascending: false });
    setBookings((data as Booking[]) ?? []);
  }, []);

  const refreshPhotos = useCallback(async () => {
    const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
    setPhotos((data as GalleryPhoto[]) ?? []);
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([refreshSlots(), refreshBookings(), refreshPhotos()]);
      setLoading(false);
    })();
  }, [refreshSlots, refreshBookings, refreshPhotos]);

  const addSlot = useCallback(async (date: string, time: string, location?: 'bcn' | 'blanes') => {
    const resolvedLocation = location ?? locationForSlot(date, time);
    await supabase.from('slots').insert({ date, time, location: resolvedLocation });
    await refreshSlots();
  }, [refreshSlots]);

  const deleteSlot = useCallback(async (id: string) => {
    await supabase.from('slots').delete().eq('id', id);
    await refreshSlots();
  }, [refreshSlots]);

  const createBooking = useCallback(
    async (slotId: string, name: string, phone: string, service: string, note?: string, referredByPhone?: string, birthday?: string): Promise<{ ok: boolean; reason?: 'taken' }> => {
      const { data: locked, error: lockError } = await supabase
        .from('slots')
        .update({ booked: true })
        .eq('id', slotId)
        .eq('booked', false)
        .select('id');
      if (lockError) throw lockError;
      if (!locked || locked.length === 0) {
        return { ok: false, reason: 'taken' };
      }
      const { error: insertError } = await supabase.from('bookings').insert({
        slot_id: slotId,
        client_name: name,
        client_phone: phone,
        service_type: service,
        note: note?.trim() || null,
        referred_by_phone: referredByPhone?.trim() || null,
        birthday: birthday || null,
      });
      if (insertError) {
        await supabase.from('slots').update({ booked: false }).eq('id', slotId);
        await refreshSlots();
        if (insertError.code === '23505') {
          return { ok: false, reason: 'taken' };
        }
        throw insertError;
      }
      await Promise.all([refreshSlots(), refreshBookings()]);
      return { ok: true };
    },
    [refreshSlots, refreshBookings]
  );

  const deleteBooking = useCallback(
    async (id: string, slotId: string) => {
      await supabase.from('bookings').delete().eq('id', id);
      await supabase.from('slots').update({ booked: false }).eq('id', slotId);
      await Promise.all([refreshSlots(), refreshBookings()]);
    },
    [refreshSlots, refreshBookings]
  );

  const addPhotos = useCallback(async (files: File[], caption: string) => {
    const uploadedPaths: string[] = [];
    try {
      for (const file of files) {
        const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPaths.push(path);

        const { data } = supabase.storage.from('gallery-images').getPublicUrl(path);
        const { error: insertError } = await supabase
          .from('gallery')
          .insert({ image_url: data.publicUrl, caption: caption || null });
        if (insertError) throw insertError;
      }
      await refreshPhotos();
    } catch (error) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from('gallery-images').remove(uploadedPaths);
      }
      console.error('Gallery upload failed', error);
      throw new Error('No s’han pogut pujar les fotos.');
    }
  }, [refreshPhotos]);

  const verifyBirthday = useCallback(async (bookingId: string) => {
    await supabase.from('bookings').update({ birthday_verified: true }).eq('id', bookingId);
    await refreshBookings();
  }, [refreshBookings]);

  const deletePhoto = useCallback(async (photo: GalleryPhoto) => {
    const marker = '/storage/v1/object/public/gallery-images/';
    const markerIndex = photo.image_url.indexOf(marker);
    if (markerIndex >= 0) {
      const path = decodeURIComponent(photo.image_url.slice(markerIndex + marker.length));
      await supabase.storage.from('gallery-images').remove([path]);
    }
    await supabase.from('gallery').delete().eq('id', photo.id);
    await refreshPhotos();
  }, [refreshPhotos]);

  return (
    <DataContext.Provider
      value={{
        slots,
        bookings,
        photos,
        loading,
        isAdmin,
        login,
        logout,
        refreshSlots,
        refreshBookings,
        refreshPhotos,
        addSlot,
        deleteSlot,
        createBooking,
        deleteBooking,
        verifyBirthday,
        addPhotos,
        deletePhoto,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

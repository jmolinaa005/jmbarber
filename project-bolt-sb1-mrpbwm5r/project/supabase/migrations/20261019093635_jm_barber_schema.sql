/*
# JM Barber — Booking system and gallery schema

1. New Tables
- `slots`: available appointment slots manually created by the barber (Joan).
  - id (uuid pk), date (date), time (time), booked (bool default false), created_at.
- `bookings`: confirmed client bookings referencing a slot.
  - id (uuid pk), slot_id (fk -> slots.id ON DELETE CASCADE), client_name (text), client_phone (text), service_type (text: 'corte' | 'domicilio'), created_at.
- `gallery`: gallery images managed by the admin.
  - id (uuid pk), image_url (text), caption (text), created_at.

2. Security
- Single-tenant, no sign-in: clients book as anon; Joan manages via an admin UI.
- RLS enabled on all tables; anon + authenticated CRUD allowed (data is intentionally public/shared for this app).

3. Notes
- When a booking is created, the related slot is marked booked=true by the client.
- Deleting a booking (admin cancels) should free the slot (handled in app logic).
*/

CREATE TABLE IF NOT EXISTS slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time time NOT NULL,
  booked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_slots" ON slots;
CREATE POLICY "anon_select_slots" ON slots FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_slots" ON slots;
CREATE POLICY "anon_insert_slots" ON slots FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_slots" ON slots;
CREATE POLICY "anon_update_slots" ON slots FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_slots" ON slots;
CREATE POLICY "anon_delete_slots" ON slots FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid NOT NULL REFERENCES slots(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  service_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_bookings" ON bookings;
CREATE POLICY "anon_select_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_bookings" ON bookings;
CREATE POLICY "anon_insert_bookings" ON bookings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_bookings" ON bookings;
CREATE POLICY "anon_update_bookings" ON bookings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_bookings" ON bookings;
CREATE POLICY "anon_delete_bookings" ON bookings FOR DELETE
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS gallery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_gallery" ON gallery;
CREATE POLICY "anon_select_gallery" ON gallery FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_gallery" ON gallery;
CREATE POLICY "anon_insert_gallery" ON gallery FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_gallery" ON gallery;
CREATE POLICY "anon_delete_gallery" ON gallery FOR DELETE
  TO anon, authenticated USING (true);

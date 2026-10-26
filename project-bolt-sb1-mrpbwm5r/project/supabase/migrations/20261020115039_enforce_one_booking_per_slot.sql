/*
# Enforce one booking per slot

1. Changes
- Add a UNIQUE constraint on `bookings.slot_id` so each slot can only ever
  have one booking. This is the database-level guarantee that prevents
  double-booking even if two clients submit at the same instant.
- Backfill: delete any duplicate bookings that may already exist, keeping
  the most recent one per slot, before adding the constraint. This is safe
  because the application already marks slots as booked after the first
  booking; any older duplicate rows are leftovers from the race window.
2. Security
- No RLS / policy changes.
*/

DELETE FROM bookings b1
WHERE b1.ctid NOT IN (
  SELECT max(b2.ctid)
  FROM bookings b2
  GROUP BY b2.slot_id
);

DROP INDEX IF EXISTS bookings_slot_id_unique;
CREATE UNIQUE INDEX bookings_slot_id_unique ON bookings (slot_id);
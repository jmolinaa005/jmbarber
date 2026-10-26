/*
# Add location to slots

1. Modified table
- `slots.location` stores where the appointment takes place: 'bcn' or 'blanes'.
- Existing rows backfilled to 'bcn' as a safe default; new inserts should supply the value explicitly.

2. Security
- Existing single-tenant policies remain unchanged.
*/

ALTER TABLE slots
ADD COLUMN IF NOT EXISTS location text NOT NULL DEFAULT 'bcn';

UPDATE slots SET location = 'bcn' WHERE location IS NULL;
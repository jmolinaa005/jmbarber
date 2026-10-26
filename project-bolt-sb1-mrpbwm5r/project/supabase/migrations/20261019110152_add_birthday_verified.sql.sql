/*
# Track birthday promotion verification

1. Modified table
- `bookings.birthday_verified` records whether the barber has checked the client's ID for the birthday promotion.
- Defaults to false. Only the admin updates it from the admin panel.

2. Security
- Existing single-tenant policies remain unchanged.
- The admin panel is the only place this value is shown and updated.
*/

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS birthday_verified boolean NOT NULL DEFAULT false;
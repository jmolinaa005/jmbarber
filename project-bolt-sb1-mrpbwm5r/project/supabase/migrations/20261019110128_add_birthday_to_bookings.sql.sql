/*
# Add birthday tracking to bookings

1. Modified table
- `bookings.birthday` stores the client's optional date of birth.
- Used to detect birthday promotions: when the booked slot's month and day match the client's birthday, the haircut is 3€.

2. Security
- Existing single-tenant policies remain unchanged.
- The birthday value is optional and supplied by the client during booking.

3. Important notes
- The barber verifies identity in person on the day of the appointment.
- The application flags birthday bookings in the admin panel so the barber knows to check the client's ID.
*/

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS birthday date;
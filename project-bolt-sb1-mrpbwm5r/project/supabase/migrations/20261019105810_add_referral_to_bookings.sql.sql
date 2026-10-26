/*
# Add referral tracking to bookings

1. Modified table
- `bookings.referred_by_phone` stores the optional phone number of the existing client who referred a new client.
- The value is entered during booking and is used only for the private admin promotion summary.

2. Security
- Keep the existing single-tenant policies because this application does not have user accounts.
- The public booking flow can submit the optional referral value, while the application only renders promotion totals inside the admin panel.

3. Important notes
- Haircut loyalty is calculated from haircut reservations grouped by the client's phone number.
- Referral rewards are calculated from unique referred client phone numbers grouped by the referrer's phone number.
- Existing bookings remain valid because the new column is nullable.
*/

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS referred_by_phone text;
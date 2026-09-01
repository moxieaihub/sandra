ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS phone_country_code text,
  ADD COLUMN IF NOT EXISTS phone_national text,
  ADD COLUMN IF NOT EXISTS phone_e164 text;

ALTER TABLE public.waitlist_signups
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS phone_country_code text,
  ADD COLUMN IF NOT EXISTS phone_national text,
  ADD COLUMN IF NOT EXISTS phone_e164 text;

ALTER TABLE public.registrations ALTER COLUMN state DROP NOT NULL;
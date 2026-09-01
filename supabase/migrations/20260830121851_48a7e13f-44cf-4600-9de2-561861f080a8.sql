CREATE TABLE public.tiers (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_naira integer NOT NULL,
  whatsapp_link text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.tiers TO anon;
GRANT SELECT ON public.tiers TO authenticated;
GRANT ALL ON public.tiers TO service_role;

ALTER TABLE public.tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers are publicly readable" ON public.tiers FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.tiers (id, name, price_naira, whatsapp_link, is_active, sort_order) VALUES
  ('foundation', 'Foundation', 10000, '', true, 1),
  ('professional', 'Professional', 50000, '', true, 2),
  ('elite', 'Elite', 150000, '', true, 3);

CREATE TABLE public.registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  state text NOT NULL,
  city text,
  category text NOT NULL,
  tier_id text NOT NULL REFERENCES public.tiers(id),
  amount_paid integer NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  paystack_reference text,
  heard_from text,
  whatsapp_link_sent boolean NOT NULL DEFAULT false,
  receipt_email_sent boolean NOT NULL DEFAULT false
);

GRANT INSERT ON public.registrations TO anon;
GRANT INSERT ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a pending registration" ON public.registrations
  FOR INSERT TO anon, authenticated
  WITH CHECK (payment_status = 'pending');

CREATE INDEX registrations_reference_idx ON public.registrations (paystack_reference);
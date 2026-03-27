-- Seed data for local development and testing.
-- Run after applying migrations: supabase db reset  (or paste into the SQL Editor).

-- Test promo codes
-- DEVKIT100  — grants 100 credits, single-use, no expiry
-- DEVKIT500  — grants 500 credits, up to 10 uses, no expiry
-- LAUNCH2024 — grants 250 credits, single-use, expires 2027-01-01
insert into promo_codes (code, credits, max_uses, expires_at) values
  ('DEVKIT100',  100,  1,  null),
  ('DEVKIT500',  500,  10, null),
  ('LAUNCH2024', 250,  1,  '2027-01-01 00:00:00+00')
on conflict (code) do nothing;

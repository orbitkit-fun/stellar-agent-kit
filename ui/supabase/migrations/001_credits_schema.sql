-- Credits system schema
-- Run this migration once in your Supabase project (SQL Editor or via supabase db push).

-- Stores per-app credit balances and plan info
create table if not exists credit_accounts (
  app_id            text primary key,
  balance           integer not null default 0,
  plan              text not null default 'free',
  monthly_allowance integer not null default 100,
  allowance_reset_at timestamptz not null default now() + interval '1 month',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Immutable ledger of every credit change
create table if not exists credit_transactions (
  id         uuid primary key default gen_random_uuid(),
  app_id     text not null,
  delta      integer not null,
  reason     text not null,
  endpoint   text,
  created_at timestamptz not null default now()
);

-- Redeemable promo codes that grant credits
create table if not exists promo_codes (
  id         uuid primary key default gen_random_uuid(),
  code       text unique not null,
  credits    integer not null,
  max_uses   integer not null default 1,
  uses       integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Atomically adds credits to an account (used by addCredits())
create or replace function add_credits(p_app_id text, p_amount integer)
returns void language sql as $$
  update credit_accounts
  set balance    = balance + p_amount,
      updated_at = now()
  where app_id = p_app_id;
$$;

-- Credit accounts: one per app/user
create table if not exists credit_accounts (
  app_id        text primary key,
  balance       integer not null default 0,
  plan          text not null default 'free' check (plan in ('free', 'builder', 'pro')),
  monthly_allowance integer not null default 100,
  allowance_reset_at timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Credit transactions: ledger of all balance changes
create table if not exists credit_transactions (
  id          uuid primary key default gen_random_uuid(),
  app_id      text not null references credit_accounts(app_id) on delete cascade,
  delta       integer not null,
  reason      text not null,
  endpoint    text,
  created_at  timestamptz not null default now()
);

-- Promo codes: redeemable credit grants
create table if not exists promo_codes (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  credits     integer not null,
  max_uses    integer not null default 1,
  uses        integer not null default 0,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

-- Indexes for common lookups
create index if not exists idx_credit_transactions_app_id on credit_transactions(app_id);
create index if not exists idx_promo_codes_code on promo_codes(code);

-- Enable RLS (policies should be added per deployment)
alter table credit_accounts enable row level security;
alter table credit_transactions enable row level security;
alter table promo_codes enable row level security;

# Supabase Setup

This directory contains the database migrations for the Stellar Agent Kit credits system.

## Tables

- **credit_accounts** — One account per app/user, tracks balance and plan tier
- **credit_transactions** — Ledger of all credit changes (grants, usage, promos)
- **promo_codes** — Redeemable promotional credit codes

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Set environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Run migrations using Supabase CLI:
   ```bash
   npx supabase db push
   ```
   Or apply manually via the Supabase SQL editor.

## Row Level Security

RLS is enabled on all tables. You should add policies appropriate for your deployment (e.g., allow authenticated users to read their own credit account).

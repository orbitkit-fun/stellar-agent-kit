# Orbit — Stellar DevKit UI (Option 1)

Landing, Swap, DevKit, and Protocols. Uses the SDK via `lib/agent-kit` and Freighter for wallet/signing.

## Get the SDK working (Option 1)

1. **From repo root** (installs all workspaces including ui):
   ```bash
   npm install
   npm run dev:ui
   ```
   Or from this folder:
   ```bash
   cd ui
   npm install
   npm run dev
   ```

2. **Env** — Copy env and set your key:
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and set `SOROSWAP_API_KEY=sk_...` (get from SoroSwap).  
   Without it, **quote** still works; **Swap** (build + submit) will fail until the key is set.

3. **Wallet** — Install [Freighter](https://www.freighter.app/) in the browser, then open http://localhost:3000 → Connect Wallet → Swap.

4. **Test** — On the Swap page: pick XLM → USDC (or vice versa), enter amount, click Swap. You should get a quote; with `SOROSWAP_API_KEY` set, build and sign with Freighter, then submit.

## Database setup

The credits system requires three Supabase tables. Follow these steps once per project.

### Option A — Supabase CLI (recommended)

```bash
# Install the CLI if you haven't already
npm install -g supabase

# Link to your Supabase project (get the project ref from app.supabase.com)
supabase link --project-ref <your-project-ref>

# Apply the migration
supabase db push

# (Optional) load test promo codes for local development
supabase db reset   # applies migrations + seed.sql automatically
# — or, to seed without resetting —
supabase db execute --file supabase/seed.sql
```

### Option B — Supabase SQL Editor

1. Open your project at [app.supabase.com](https://app.supabase.com) → **SQL Editor**.
2. Paste the contents of `ui/supabase/migrations/001_credits_schema.sql` and click **Run**.
3. (Optional) Paste `ui/supabase/seed.sql` and run it to insert test promo codes.

### Environment variables

Add the following to `ui/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

The app falls back to an in-memory store when these variables are absent, so the credits system still works locally without Supabase — balances just won't persist across restarts.

### Test promo codes (after seeding)

| Code | Credits | Max uses |
|------|---------|----------|
| `DEVKIT100` | 100 | 1 |
| `DEVKIT500` | 500 | 10 |
| `LAUNCH2024` | 250 | 1 |

## Pages

- **/** — Landing
- **/swap** — Swap (quote + build + sign with Freighter + submit)
- **/devkit** — Packages, networks, code snippets
- **/protocols** — Stellar DeFi protocols and code per protocol

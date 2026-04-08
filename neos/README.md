# Neos — Onboarding subdomain (neos.orbitkit.fun)

Standalone Next.js app containing the Stellar onboarding flow. Deploy this app to **neos.orbitkit.fun** as a separate Vercel project; the main Orbit app stays on **orbitkit.fun**.

## Routes

- `/` — Onboarding landing (hero, Choose Your Path, video, stats, Join Orbit)
- `/beginners` — New to Crypto (10%)
- `/explore` — Seasoned Web3 Users (25%)
- `/developers` — Developers (50%)

All “Open Orbit”, “Docs”, “Open Swap”, “DevKit”, etc. links point to **https://orbitkit.fun**.

## Setup

1. **Install dependencies**
   ```bash
   cd neos
   npm install
   ```

2. **Copy assets from main app** (if not already present)
   - From repo root:
   ```bash
   # Optional: copy Stellar logo and Orbit favicon from ui/public if they exist
   cp ui/public/stellar-logo.png neos/public/ 2>/dev/null || true
   cp ui/public/brand/orbit/orbit.png neos/public/brand/orbit/ 2>/dev/null || true
   ```
   - Partner logos (soroswap, blend, allbridge) are under `neos/public/brand/partners/`. Copy from `ui/public/brand/partners/` if missing.

3. **Run locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Deploy to neos.orbitkit.fun (Vercel + GoDaddy)

### 1. Vercel

1. In [Vercel](https://vercel.com): **Add New Project** → **Import** your Git repo (e.g. `stellar-devkit`).
2. **Root Directory**: set to **`neos`** (so only the Neos app is built).
3. **Framework Preset**: Next.js (auto-detected).
4. Deploy. Note the default Vercel URL (e.g. `neos-xxx.vercel.app`).

### 2. Assign custom domain in Vercel

1. Project → **Settings** → **Domains**.
2. Add **neos.orbitkit.fun**.
3. Vercel will show the target to use for DNS (e.g. **CNAME** → `cname.vercel-dns.com` or a project-specific target like `neos-xxx.vercel.app`). Use the value Vercel shows.

### 3. GoDaddy DNS

1. Log in to [GoDaddy](https://www.godaddy.com) → **My Products** → **DNS** for **orbitkit.fun**.
2. Add a record:
   - **Type**: CNAME  
   - **Name**: `neos`  
   - **Value**: the Vercel target (e.g. `cname.vercel-dns.com` or the project hostname Vercel gave you)  
   - **TTL**: 600 (or default)
3. Save. DNS can take a few minutes to an hour to propagate.

### 4. SSL

Vercel will issue a certificate for **neos.orbitkit.fun** once the CNAME is correct and the domain is verified.

## Build

```bash
cd neos
npm run build
```

## Summary

- **Neos** = this app (`neos/`), deployed as its own Vercel project with root directory `neos`, at **neos.orbitkit.fun**.
- **Orbit** = main app (`ui/`), at **orbitkit.fun**.
- All cross-links from Neos (Docs, Open Orbit, Swap, DevKit, etc.) use **https://orbitkit.fun**.

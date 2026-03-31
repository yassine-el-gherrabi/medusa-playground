# CI/CD & Hosting Strategy for Ice Industry
## Medusa v2 + Next.js 16 Storefront — Professional Recommendation

**Prepared for:** Ice Industry (Streetwear brand, Marseille)
**Date:** March 31, 2026
**Stack:** Medusa v2 (Node.js, PostgreSQL, Redis) + Next.js 16 (App Router, React 19, Tailwind v4) + Stripe

---

## Table of Contents

1. [Hosting Options for Medusa v2 Backend](#1-hosting-options-for-medusa-v2-backend)
2. [Hosting Options for Next.js Storefront](#2-hosting-options-for-nextjs-storefront)
3. [CI/CD Pipeline Architecture](#3-cicd-pipeline-architecture)
4. [Staging vs Production Environment Strategy](#4-staging-vs-production-environment-strategy)
5. [Medusa-Specific Deployment Considerations](#5-medusa-specific-deployment-considerations)
6. [Monorepo vs Separate Repos](#6-monorepo-vs-separate-repos)
7. [Cost Estimation](#7-cost-estimation)
8. [Recommended Stack](#8-recommended-stack)

---

## 1. Hosting Options for Medusa v2 Backend

### What Medusa Officially Recommends

Medusa now offers **Medusa Cloud**, their managed PaaS launched in October 2025. The official documentation actively steers users toward Cloud and provides self-hosting guides for Railway, DigitalOcean, and general Node.js hosting as alternatives.

Key requirements from the docs:
- **Node.js server hosting** (Medusa is not serverless)
- **PostgreSQL** database
- **Redis** for session management, events, and caching
- **Two instances**: one in `server` mode (handles API + Admin), one in `worker` mode (handles background jobs)
- **Minimum 2GB RAM** recommended

### Option A: Medusa Cloud (Managed)

| Aspect | Details |
|--------|---------|
| **Develop plan** | $29/month |
| **Scale plan** | $299/month |
| **GMV fees** | 0% on all plans |
| **Included** | PostgreSQL, Redis, S3 storage, Admin dashboard, push-to-deploy, preview environments, email sending, SSL/TLS, auto-scaling (Scale plan) |
| **Staging/Preview** | 1 preview environment included on Develop, 3 on Scale. Additional LLEs at $60/mo each |
| **Compute** | 600 hrs/mo (Develop), 2,800 hrs/mo (Scale), then $0.16/hr |
| **Storage** | 1GB object storage + 1GB database (Develop), 10GB each (Scale) |

**Pros:**
- Zero infrastructure management — Medusa team handles everything
- Built-in preview environments for PRs (with their own branched databases)
- Push-to-deploy from GitHub
- Pre-configured Redis, PostgreSQL, S3, caching layer
- Zero-downtime deployments on Scale plan
- Built-in transactional email service
- Storefront deployment support
- The team behind Medusa maintains the infrastructure — they know their own software best

**Cons:**
- Develop plan is limited (1 shared server, no automatic backups, no zero-downtime deploy)
- Scale plan at $299/mo is significant for a small brand
- Less control over infrastructure
- Additional LLEs (staging environments) cost $60/mo each
- Compute overages at $0.16/hr can add up

### Option B: Railway (Self-Hosted)

| Aspect | Details |
|--------|---------|
| **Base cost** | $5/mo minimum (Hobby) or $20/seat/mo (Pro) |
| **Pricing model** | Usage-based: $0.000231/vCPU-minute + $0.000231/GB-minute |
| **PostgreSQL** | Built-in, one-click provisioning |
| **Redis** | Built-in, one-click provisioning |
| **Preview environments** | Automatic branch-based previews on Pro |
| **Typical cost** | $20-60/mo for a small Medusa setup |

**Pros:**
- Excellent developer experience (closest to Medusa Cloud for self-hosting)
- One-click PostgreSQL and Redis provisioning
- Automatic deployments from GitHub
- Built-in preview environments for PRs (Pro plan)
- Dynamic environment variables (reference services with template syntax)
- Railway CLI for running migrations remotely
- Well-documented Medusa deployment guides exist
- Multiple services in one project (server, worker, PostgreSQL, Redis)

**Cons:**
- Usage-based pricing can be unpredictable
- Primarily US regions (EU coming but not fully available)
- No edge functions
- You manage the deployment configuration yourself
- No Medusa-specific optimizations

### Option C: DigitalOcean App Platform

| Aspect | Details |
|--------|---------|
| **Base cost** | $12-25/mo per service |
| **Managed PostgreSQL** | Starting at $15/mo |
| **Managed Redis** | Starting at $15/mo |
| **Total estimate** | $50-100/mo for full setup |

**Pros:**
- Predictable pricing
- Managed databases with automatic backups
- EU data centers (Amsterdam — relevant for France)
- Good documentation
- App Platform supports Node.js natively

**Cons:**
- More manual setup than Railway
- No built-in preview environments on App Platform
- Less streamlined developer experience
- Need to manage deployments more carefully

### Option D: Render

| Aspect | Details |
|--------|---------|
| **Web service** | $7/mo (Starter) or $25/mo (Standard, 2GB RAM) |
| **Managed PostgreSQL** | Starting at $7/mo |
| **Redis** | Starting at $7/mo |
| **Total estimate** | $25-60/mo |

**Pros:**
- Simple, predictable pricing
- Built-in PostgreSQL and Redis
- Preview environments included
- Free SSL, global CDN
- Easy setup

**Cons:**
- Cold starts on lower tiers
- Limited regions
- Slower builds than Railway
- Less flexible than Railway for multi-service setups

### Option E: Fly.io

| Aspect | Details |
|--------|---------|
| **Base cost** | ~$2/mo per VM minimum |
| **Typical cost** | $20-50/mo |

**Pros:**
- Global edge deployment
- Low latency worldwide
- Good for real-time features

**Cons:**
- More complex setup
- Not ideal for database-heavy applications
- Managed databases are newer/less mature
- Steeper learning curve

### RECOMMENDATION: Railway (Pro) for self-hosting

**Why Railway over alternatives:**
- Best developer experience for self-hosting Medusa v2
- Built-in PostgreSQL + Redis in the same project
- Automatic GitHub deployments with preview environments
- Template syntax for dynamic environment variables between services
- Well-documented Medusa deployment path
- Cost-effective for a small brand ($30-60/mo typical)
- Railway CLI enables running migrations remotely

**Why not Medusa Cloud (yet):**
- The Develop plan at $29/mo is too limited for production (no backups, no zero-downtime)
- The Scale plan at $299/mo is expensive for a small brand starting out
- Railway gives more control at a fraction of the cost
- Migration path to Medusa Cloud exists when the brand grows

---

## 2. Hosting Options for Next.js Storefront

### Option A: Vercel (Recommended)

| Aspect | Details |
|--------|---------|
| **Hobby** | Free (non-commercial) |
| **Pro** | $20/month per team member |
| **Bandwidth** | 1TB included on Pro |
| **Serverless functions** | 1000 GB-hours on Pro |
| **Preview deployments** | Automatic on every PR |
| **Edge network** | 126+ PoPs globally |

**Pros:**
- Built by the creators of Next.js — best possible support for Next.js 16 features
- Automatic preview deployments for every PR (perfect for client review)
- Zero-config deployment
- Global edge network with excellent TTFB
- ISR, Server Components, App Router fully supported
- Built-in analytics and speed insights
- Excellent developer experience
- Draft Mode support for content preview

**Cons:**
- $20/mo per team member
- Bandwidth overages at $40/100GB after 1TB
- Potential vendor lock-in (though Next.js is portable)
- Image optimization limited to 5000 images on Pro, then $5/1000

### Option B: Netlify

| Aspect | Details |
|--------|---------|
| **Free** | 100GB bandwidth, 300 build minutes |
| **Pro** | $19/user/month |

**Pros:**
- Good Next.js support
- Preview deployments
- Built-in forms and identity
- Commercial use allowed on free tier

**Cons:**
- Next.js support is less native than Vercel
- Slower builds for Next.js
- Some SSR features may not work identically

### Option C: Cloudflare Pages

| Aspect | Details |
|--------|---------|
| **Free** | Unlimited bandwidth |
| **Pro** | $20/month |

**Pros:**
- Unlimited bandwidth (major cost advantage)
- Global CDN
- Fast edge network

**Cons:**
- Next.js support is improving but not yet on par with Vercel
- Some Next.js features may require workarounds
- Less mature for full Next.js App Router applications

### Option D: Self-hosted on Railway

| Aspect | Details |
|--------|---------|
| **Cost** | $10-30/mo additional |

**Pros:**
- Same platform as backend — simpler management
- No vendor fragmentation

**Cons:**
- Loses all Vercel-specific Next.js optimizations
- No edge functions
- No automatic image optimization
- Preview environments less polished for frontends
- Significantly worse performance for a storefront

### RECOMMENDATION: Vercel Pro ($20/mo)

**Why Vercel:**
- Next.js is their product — the integration is unmatched
- Automatic preview deployments give the client a live URL for every PR
- Global edge network delivers excellent performance for an e-commerce storefront
- ISR and Server Components work perfectly
- The storefront connects to the Medusa backend via API — completely decoupled
- $20/mo is very reasonable for the value delivered
- 1TB bandwidth is generous for a small streetwear brand

---

## 3. CI/CD Pipeline Architecture

### Recommended: GitHub Actions

GitHub Actions is the clear choice for this setup:
- The code is already on GitHub
- Free for public repos, 2000 minutes/mo for private repos
- Native integration with both Vercel and Railway
- Rich ecosystem of actions
- Environment secrets management built-in

### CI Pipeline (on every PR)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, staging]

jobs:
  # Backend CI
  backend-ci:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend  # or root if Medusa is at root
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'  # or pnpm

      - run: yarn install --frozen-lockfile
      - run: yarn typecheck
      - run: yarn lint
      - run: yarn build

  # Storefront CI
  storefront-ci:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./storefront
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - run: yarn install --frozen-lockfile
      - run: yarn typecheck
      - run: yarn lint
      - run: yarn build
```

### CD Pipeline (deployment)

**Storefront deployment is handled automatically by Vercel:**
- Every push to a PR branch creates a preview deployment
- Every merge to `main` deploys to production
- No GitHub Actions needed for storefront deployment

**Backend deployment is handled by Railway:**
- Railway watches the GitHub repo and auto-deploys on push
- Configure Railway to deploy `staging` branch to staging environment
- Configure Railway to deploy `main` branch to production environment

### Environment Variables Strategy

```
# Per-environment variables managed in each platform:

# Railway (Backend) — Staging
DATABASE_URL=postgresql://...staging-db...
REDIS_URL=redis://...staging-redis...
MEDUSA_BACKEND_URL=https://api-staging.iceindustry.fr
STORE_CORS=https://staging.iceindustry.fr
STRIPE_API_KEY=sk_test_...  # Stripe TEST key
MEDUSA_WORKER_MODE=server  # or worker for worker instance

# Railway (Backend) — Production
DATABASE_URL=postgresql://...production-db...
REDIS_URL=redis://...production-redis...
MEDUSA_BACKEND_URL=https://api.iceindustry.fr
STORE_CORS=https://iceindustry.fr
STRIPE_API_KEY=sk_live_...  # Stripe LIVE key
MEDUSA_WORKER_MODE=server

# Vercel (Storefront) — handled via Vercel Environment Variables
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.iceindustry.fr  # Production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api-staging.iceindustry.fr  # Preview
```

Vercel supports **per-environment variables**: you can set different values for Production, Preview, and Development environments directly in the dashboard.

### Database Migrations on Deploy

Medusa handles this with a `predeploy` script:

```json
// package.json
{
  "scripts": {
    "predeploy": "medusa db:migrate",
    "start": "medusa start"
  }
}
```

Railway start command:
```bash
cd .medusa/server && yarn install && yarn predeploy && yarn run start
```

The `predeploy` script runs `medusa db:migrate` which handles schema migrations and link syncing automatically before the application starts. This runs on every deployment.

### Zero-Downtime Deployments

- **Vercel**: Built-in. Atomic deployments — old version serves until new version is ready.
- **Railway**: Supports health checks. Configure a health check endpoint, and Railway will only route traffic to the new deployment once it passes.

```json
// railway.json (or via Railway dashboard)
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

You should add a health check endpoint in your Medusa application (a simple API route returning 200).

---

## 4. Staging vs Production Environment Strategy

### Recommended Architecture

```
PRODUCTION                          STAGING
─────────────────────               ─────────────────────
iceindustry.fr                      staging.iceindustry.fr
  │                                   │
  ├── Vercel (storefront)             ├── Vercel Preview (storefront)
  │   └── Production env vars         │   └── Preview env vars
  │                                   │
  ├── api.iceindustry.fr              ├── api-staging.iceindustry.fr
  │   ├── Railway: Medusa Server      │   ├── Railway: Medusa Server
  │   └── Railway: Medusa Worker      │   └── Railway: Medusa Worker
  │                                   │
  ├── PostgreSQL (production)         ├── PostgreSQL (staging)
  ├── Redis (production)              ├── Redis (staging)
  └── S3/R2 (production bucket)      └── S3/R2 (staging bucket)
```

### Separate Databases (Not Same DB)

**Use completely separate PostgreSQL databases for staging and production.** This is critical:
- Prevents accidental data corruption in production
- Allows testing migrations safely on staging first
- Staging can have test/dummy product data
- Production data stays clean and secure
- Each Railway "project" gets its own database instances

### Separate Medusa Backends

Run **two complete Railway projects** — one for staging, one for production. Each contains:
1. Medusa Server instance
2. Medusa Worker instance
3. PostgreSQL database
4. Redis instance

This is simpler and safer than trying to share infrastructure.

### Syncing Product Data Between Environments

For a small brand, the simplest approach:
1. **Set up products in production** via the Medusa Admin dashboard
2. **Seed staging with test data** using Medusa's seed script or manual setup
3. If needed, **export/import database dumps** for specific tables
4. For major catalog changes, test in staging first, then replicate in production

Medusa does not have a built-in environment sync feature. For a small catalog (a streetwear brand likely has <500 SKUs), managing this manually is practical.

### Stripe Test Mode for Staging

Stripe makes this straightforward:
- **Staging**: Use Stripe **test API keys** (`sk_test_...`, `pk_test_...`)
- **Production**: Use Stripe **live API keys** (`sk_live_...`, `pk_live_...`)
- Stripe test mode provides test card numbers (4242 4242 4242 4242)
- Webhooks: Configure separate webhook endpoints for each environment
  - `https://api-staging.iceindustry.fr/hooks/payment/stripe`
  - `https://api.iceindustry.fr/hooks/payment/stripe`

### Domain Strategy

| Domain | Purpose | Platform |
|--------|---------|----------|
| `iceindustry.fr` | Production storefront | Vercel |
| `staging.iceindustry.fr` | Staging storefront | Vercel (branch deploy or separate project) |
| `api.iceindustry.fr` | Production Medusa API + Admin | Railway |
| `api-staging.iceindustry.fr` | Staging Medusa API + Admin | Railway |
| `admin.iceindustry.fr` | (Optional) Alias for `api.iceindustry.fr` | Railway (same service) |

**Note:** The Medusa Admin dashboard is served by the Medusa server itself. It is accessed at `https://api.iceindustry.fr/app` by default. No separate deployment needed.

---

## 5. Medusa-Specific Deployment Considerations

### Database Migrations

Medusa uses a `predeploy` script approach:
```bash
medusa db:migrate
```
This command:
- Runs pending database migrations
- Syncs module links
- Is idempotent (safe to run multiple times)
- Should run **before** the application starts on every deployment

The Railway start command chains these: `yarn predeploy && yarn start`

### Admin Dashboard

The Medusa Admin is **built into the server instance**:
- Set `DISABLE_MEDUSA_ADMIN=false` on the server instance
- Set `DISABLE_MEDUSA_ADMIN=true` on the worker instance
- Admin is served as static files at `/app` on the server URL
- Set `MEDUSA_BACKEND_URL` environment variable so the Admin knows which API to call
- The admin build happens during `medusa build` — requires environment variables to be set

### Worker Processes

Medusa v2 requires two instances in production:

**Server instance** (`MEDUSA_WORKER_MODE=server`):
- Handles HTTP API requests
- Serves the Admin dashboard
- Does NOT process background jobs

**Worker instance** (`MEDUSA_WORKER_MODE=worker`):
- Processes scheduled jobs (e.g., inventory sync)
- Handles event subscribers (e.g., send email after order)
- Does NOT serve HTTP traffic
- Admin disabled (`DISABLE_MEDUSA_ADMIN=true`)

Both instances connect to the **same** PostgreSQL and Redis databases. Redis is used for the event bus between server and worker.

### File Uploads / Product Images

**Recommended: Cloudflare R2** (S3-compatible)

| Aspect | Cloudflare R2 | AWS S3 |
|--------|---------------|--------|
| Storage | $0.015/GB/mo | $0.023/GB/mo |
| Egress | **Free** | $0.09/GB |
| Class A ops | $4.50/million | $5.00/million |
| Class B ops | $0.36/million | $0.40/million |

For a small e-commerce with ~500 products and ~5 images each (~2500 images at ~500KB each = ~1.25GB), R2 costs are negligible (under $1/mo for storage, $0 for egress).

Medusa's S3 File Module Provider works with R2 out of the box since R2 is S3-compatible:

```typescript
// medusa-config.ts
{
  resolve: "@medusajs/medusa/file",
  options: {
    providers: [{
      resolve: "@medusajs/medusa/file-s3",
      id: "s3",
      options: {
        file_url: process.env.S3_FILE_URL,          // R2 public URL
        access_key_id: process.env.S3_ACCESS_KEY_ID,
        secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
        region: "auto",                               // R2 uses "auto"
        bucket: process.env.S3_BUCKET,
        endpoint: process.env.S3_ENDPOINT,            // R2 endpoint
      },
    }],
  },
}
```

### Redis

Railway provides managed Redis provisioned in the same project. No external service needed:
- Redis is used for: event bus (pub/sub between server and worker), session storage, caching
- Railway's Redis auto-generates the `REDIS_URL` and makes it available via template variables: `${{ Redis.REDIS_URL }}`

---

## 6. Monorepo vs Separate Repos

### Current Situation

You currently have both storefront and backend in `medusa-playground/` workspace.

### Recommendation: Separate Repos

For this project size and deployment strategy, **separate repositories** are recommended:

| Criteria | Monorepo | Separate Repos |
|----------|----------|----------------|
| Deployment coupling | Coupled — changes to one may trigger rebuilds of both | Independent — deploy each on its own schedule |
| CI/CD complexity | Need path filters, Turborepo, cache management | Simple — each repo has its own CI/CD |
| Vercel integration | Vercel needs root directory configuration | Clean — Vercel connects directly to the storefront repo |
| Railway integration | Need to configure which directory to build | Clean — Railway connects directly to the backend repo |
| Shared code | Possible with workspace packages | Need to publish shared packages (or duplicate minimal code) |
| Team workflow | More complex PR reviews (backend + frontend in same PR) | Clear separation of concerns |

**Why separate repos works better here:**
1. **Vercel expects to be the sole deployer of a repo.** In a monorepo, you need extra configuration.
2. **Railway also expects to build from a repo root** (or needs custom build paths).
3. **The storefront and backend are independently deployable** — they communicate via HTTP API only.
4. **For a small team**, the overhead of Turborepo/pnpm workspaces is not justified.
5. **No shared code** between Medusa backend and Next.js storefront (different frameworks, different dependencies).

### Proposed Structure

```
GitHub:
├── ice-industry-backend/          # Medusa v2 application
│   ├── src/
│   ├── medusa-config.ts
│   ├── package.json
│   └── .github/workflows/ci.yml
│
└── ice-industry-storefront/       # Next.js 16 application
    ├── src/
    ├── next.config.ts
    ├── package.json
    └── .github/workflows/ci.yml
```

### If You Want a Monorepo Later

If the project grows and you want shared types or utilities:
- Use **pnpm workspaces** (simpler than Turborepo for 2 packages)
- Configure Vercel's "Root Directory" setting to point to `storefront/`
- Configure Railway's build to point to `backend/`
- Add path filters in GitHub Actions to only run relevant CI jobs

---

## 7. Cost Estimation

### Monthly Cost Breakdown — Recommended Stack

| Service | Component | Staging | Production | Monthly Total |
|---------|-----------|---------|------------|---------------|
| **Railway** | Medusa Server | ~$10 | ~$15 | $25 |
| **Railway** | Medusa Worker | ~$7 | ~$10 | $17 |
| **Railway** | PostgreSQL | ~$7 | ~$7 | $14 |
| **Railway** | Redis | ~$5 | ~$5 | $10 |
| **Vercel** | Storefront (Pro) | included | $20/seat | $20 |
| **Cloudflare R2** | File storage | ~$0 | ~$1 | $1 |
| **Domain** | iceindustry.fr | — | ~$1 | $12/year |
| **GitHub** | Private repos | — | — | Free (Team) |
| | | | **TOTAL** | **~$87-100/mo** |

### Cost Comparison Across Strategies

| Strategy | Monthly Cost | Complexity | Scalability |
|----------|-------------|------------|-------------|
| **Railway + Vercel** (recommended) | $87-100 | Low-Medium | Good |
| **Medusa Cloud Develop + Vercel** | $49 + extras | Very Low | Limited |
| **Medusa Cloud Scale + Vercel** | $319 | Very Low | Excellent |
| **DigitalOcean + Vercel** | $80-120 | Medium | Good |
| **Render + Vercel** | $60-90 | Low | Moderate |
| **Full Railway** (backend + frontend) | $60-80 | Medium | Good |
| **Full Medusa Cloud** (with storefront) | $299+ | Very Low | Excellent |

### Notes on Costs

- Railway pricing is usage-based, so these are estimates for low-medium traffic
- Vercel Pro at $20/mo is per team member — for a solo developer, it stays at $20
- Cloudflare R2 egress is free, making it extremely cost-effective for product images
- GitHub Actions: 2000 free minutes/mo for private repos is more than sufficient
- All costs exclude Stripe payment processing fees (2.9% + 30 cents per transaction in France — varies by plan)

---

## 8. Recommended Stack — Final Recommendation

### The Stack

```
┌─────────────────────────────────────────────────────────┐
│                    PRODUCTION                           │
│                                                         │
│  ┌─────────────┐    ┌──────────────────────────────┐   │
│  │   Vercel     │    │         Railway               │   │
│  │  (Next.js)   │◄──►│  ┌─────────┐ ┌────────────┐  │   │
│  │  Storefront  │    │  │ Medusa  │ │   Medusa   │  │   │
│  │              │    │  │ Server  │ │   Worker   │  │   │
│  └─────────────┘    │  └────┬────┘ └─────┬──────┘  │   │
│                      │       │            │          │   │
│                      │  ┌────▼────┐ ┌─────▼─────┐   │   │
│                      │  │PostgreSQL│ │   Redis   │   │   │
│                      │  └─────────┘ └───────────┘   │   │
│                      └──────────────────────────────┘   │
│                                                         │
│  ┌──────────────┐   ┌──────────────┐                   │
│  │ Cloudflare R2│   │    Stripe    │                   │
│  │ (images)     │   │  (payments)  │                   │
│  └──────────────┘   └──────────────┘                   │
│                                                         │
│  CI/CD: GitHub Actions                                  │
│  Source: 2 GitHub repos (backend + storefront)          │
└─────────────────────────────────────────────────────────┘
```

### Why This Stack

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Backend hosting** | Railway Pro | Best DX for Medusa self-hosting. One project bundles server + worker + PostgreSQL + Redis. Usage-based pricing is ideal for a growing brand. |
| **Storefront hosting** | Vercel Pro | Next.js creator's platform. Unmatched performance, preview deployments, zero-config. $20/mo is a bargain. |
| **File storage** | Cloudflare R2 | S3-compatible, zero egress fees, works with Medusa's S3 module. Under $1/mo for a small catalog. |
| **CI/CD** | GitHub Actions | Free tier is sufficient. Native integration with both platforms. |
| **Repo structure** | Separate repos | Clean separation. Each platform deploys from its own repo without configuration hacks. |
| **Environments** | Separate Railway projects | Complete isolation. Staging has its own DB, Redis, and Medusa instances. Safe for testing. |
| **Payments** | Stripe test/live keys per env | Standard approach. Test keys for staging, live keys for production. |

### Migration Path When Ice Industry Grows

**Phase 1 (Launch — Current):** Railway + Vercel (~$100/mo)
- Handles low-medium traffic
- Manual scaling if needed
- Good enough for launch and initial traction

**Phase 2 (Growing — 5K-20K monthly orders):** Consider Medusa Cloud Scale ($299/mo)
- Auto-scaling becomes important
- Preview environments with branched databases are valuable
- Zero-downtime deployments are critical
- Built-in backups and monitoring
- Keep Vercel for storefront

**Phase 3 (Scaling — 20K+ monthly orders):** Medusa Cloud Enterprise + Vercel Enterprise
- SLA-backed uptime
- Dedicated support
- Custom resource pricing
- Performance tuning from Medusa team

### Implementation Checklist

**Week 1 — Setup Infrastructure:**
- [ ] Create `ice-industry-backend` GitHub repo
- [ ] Create `ice-industry-storefront` GitHub repo
- [ ] Create Railway account and production project
- [ ] Create Railway staging project
- [ ] Create Vercel account and connect storefront repo
- [ ] Create Cloudflare account and R2 bucket (production + staging)
- [ ] Register/configure `iceindustry.fr` domain

**Week 2 — Configure Deployment:**
- [ ] Configure `medusa-config.ts` for worker mode, admin, Redis, S3
- [ ] Set up Railway services: Server, Worker, PostgreSQL, Redis (x2 environments)
- [ ] Set all environment variables in Railway (staging + production)
- [ ] Set Vercel environment variables (Production, Preview, Development)
- [ ] Configure custom domains on Railway and Vercel
- [ ] Set up Stripe webhook endpoints for both environments
- [ ] Add `predeploy` script for migrations

**Week 3 — CI/CD & Testing:**
- [ ] Create GitHub Actions CI workflows for both repos
- [ ] Test deployment pipeline: push to staging branch, verify preview
- [ ] Test migration flow on staging
- [ ] Test Stripe payments in staging (test mode)
- [ ] Test storefront preview deployments on Vercel
- [ ] Verify Admin dashboard access
- [ ] Load test staging environment

**Week 4 — Go Live:**
- [ ] Final production deployment
- [ ] Switch Stripe to live keys in production
- [ ] DNS configuration for production domains
- [ ] Monitor first real transactions
- [ ] Set up basic uptime monitoring (UptimeRobot — free)

---

## Appendix: GitHub Actions Workflow Examples

### Backend CI Workflow

```yaml
# .github/workflows/ci.yml (in ice-industry-backend repo)
name: Backend CI

on:
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Type check
        run: yarn typecheck

      - name: Lint
        run: yarn lint

      - name: Build
        run: yarn build
```

### Storefront CI Workflow

```yaml
# .github/workflows/ci.yml (in ice-industry-storefront repo)
name: Storefront CI

on:
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'yarn'

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Type check
        run: yarn typecheck

      - name: Lint
        run: yarn lint

      - name: Build
        run: yarn build
        env:
          NEXT_PUBLIC_MEDUSA_BACKEND_URL: https://api-staging.iceindustry.fr
```

### Railway Configuration

```json
// railway.json (in ice-industry-backend repo)
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd .medusa/server && yarn install && yarn predeploy && yarn run start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

---

*This document represents the recommended approach as of March 2026. Pricing and feature availability may change. All costs are estimates based on low-medium traffic typical of a small streetwear brand.*

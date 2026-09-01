# CI/CD Plan – Surya Women's Health System

## Overview

A **5-job GitHub Actions pipeline** that runs on every push/PR to `main`:

```
lint → test → e2e → docker (push) → deploy (Render)
```

| Job | Runs on | Triggers |
|-----|---------|---------|
| **lint** | every push/PR | always |
| **test** | after lint | always |
| **e2e** | after test | push to `main` only |
| **docker** | after test | push to `main` only |
| **deploy** | after docker | push to `main` only |

---

## Files Created / Modified

| File | Purpose |
|------|---------|
| [`.github/workflows/ci.yml`](file:///d:/Projects/Web%20Development2/Javascript%20Frameworks/Fullstack%20Frameworks/Next.js/Surya-Women's%20Health%20Tracing%20and%20Monitoring%20System%20Web%20App-NextJS%20FullStack/.github/workflows/ci.yml) | Full CI/CD pipeline |
| [`Dockerfile`](file:///d:/Projects/Web%20Development2/Javascript%20Frameworks/Fullstack%20Frameworks/Next.js/Surya-Women's%20Health%20Tracing%20and%20Monitoring%20System%20Web%20App-NextJS%20FullStack/Dockerfile) | Multi-stage production Docker build |
| [`docker-compose.yml`](file:///d:/Projects/Web%20Development2/Javascript%20Frameworks/Fullstack%20Frameworks/Next.js/Surya-Women's%20Health%20Tracing%20and%20Monitoring%20System%20Web%20App-NextJS%20FullStack/docker-compose.yml) | Local dev: App + Postgres + Prisma Studio |
| [`.dockerignore`](file:///d:/Projects/Web%20Development2/Javascript%20Frameworks/Fullstack%20Frameworks/Next.js/Surya-Women's%20Health%20Tracing%20and%20Monitoring%20System%20Web%20App-NextJS%20FullStack/.dockerignore) | Lean Docker build context |
| [`next.config.js`](file:///d:/Projects/Web%20Development2/Javascript%20Frameworks/Fullstack%20Frameworks/Next.js/Surya-Women's%20Health%20Tracing%20and%20Monitoring%20System%20Web%20App-NextJS%20FullStack/next.config.js) | Added `output: 'standalone'` for Docker |

---

## Pipeline Flow

```mermaid
graph TD
    A[Push to main / PR] --> B[lint]
    B --> C[test + Postgres service]
    C --> D[e2e – Playwright]
    C --> E[docker – build & push]
    E --> F[deploy – Render hook]
```

---

## One-time Setup Steps

### 1. GitHub Repository Secrets

Go to **GitHub → Settings → Secrets → Actions** and add:

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not password) |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `RENDER_DEPLOY_HOOK_URL` | The deploy hook URL from Render (see below) |

> [!IMPORTANT]
> `RENDER_DEPLOY_HOOK_URL` replaces the old `RENDER_SERVICE_ID` + `RENDER_API_KEY` approach. It's simpler and works on Render's free tier.

---

### 2. Docker Hub Setup

1. Sign up / log in at [hub.docker.com](https://hub.docker.com)
2. Create a **repository** named `surya-womens-health`
3. Go to **Account Settings → Security → New Access Token**
4. Copy the token → save as `DOCKERHUB_TOKEN` GitHub secret

The pipeline will push two tags on every `main` push:
- `yourusername/surya-womens-health:latest`
- `yourusername/surya-womens-health:sha-<commit>`

---

### 3. Render Free Tier Setup

1. Go to [render.com](https://render.com) and sign up
2. Click **New → Web Service**
3. Choose **Deploy an existing image from Docker Hub** or **Connect GitHub repo**

#### Option A – Docker Hub image (recommended)
- Image: `yourusername/surya-womens-health:latest`
- Set **Instance Type** → `Free`
- Add all environment variables (DATABASE_URL, NEXTAUTH_SECRET, etc.)

#### Option B – GitHub repo direct (Render builds itself)
- Connect the GitHub repo
- Build Command: `npm ci && npx prisma generate && npm run build`
- Start Command: `node .next/standalone/server.js`

4. After creating the service, go to **Settings → Deploy Hooks**
5. Copy the hook URL → save as `RENDER_DEPLOY_HOOK_URL` GitHub secret

> [!NOTE]
> Render free tier will spin down after 15 min inactivity. First request after sleep takes ~30s. Upgrade to Starter ($7/mo) to avoid this.

---

### 4. Supabase (Production DB)

Render uses your **Supabase PostgreSQL** as the production database.  
Set these in the Render environment variables panel:

```env
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
NEXTAUTH_SECRET=[a-strong-random-secret]
NEXTAUTH_URL=https://[your-render-app].onrender.com
```

---

## Local Docker Usage

```bash
# Start full local stack (app + postgres)
docker compose up --build

# With Prisma Studio too
docker compose --profile dev up

# Stop everything
docker compose down -v

# Build the production image locally
docker build -t surya-womens-health .
```

---

## What the Dockerfile Does

```
Stage 1 (deps)    – npm ci (install all packages)
Stage 2 (builder) – prisma generate → next build (standalone)
Stage 3 (runner)  – copy only .next/standalone + static files
                  – run as non-root user (nextjs:nodejs)
                  – EXPOSE 3000
```

The standalone output produces a minimal `server.js` (~50 MB image vs ~1 GB).

---

## Verification Checklist

- [ ] Push a commit to `main` → all 5 jobs pass green
- [ ] Docker Hub shows `latest` + `sha-xxxx` tags
- [ ] Render dashboard shows successful deployment
- [ ] App loads at `https://[your-app].onrender.com`
- [ ] Prisma migrations applied (check Render logs)

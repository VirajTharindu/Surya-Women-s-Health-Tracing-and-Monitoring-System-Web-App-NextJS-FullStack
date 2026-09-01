# Security and Performance Improvements Plan

This plan outlines the steps to implement the comprehensive security and performance enhancements detailed in the analysis report, tailored to not rely on Redis. 

## User Review Required

> [!WARNING]
> **Data Encryption Migration**
> Encrypting historical medical data at rest (Vitals and PinkBook records) means that any existing plaintext data in your database will need to be encrypted via a migration script, or the app will throw errors trying to decrypt plaintext strings. I will write the code to handle new entries and decrypt old/new entries gracefully, but please confirm if you have existing production data that needs a migration script.

> [!IMPORTANT]
> **Prisma Schema Changes**
> We are adding an `AuditLog` table and adding compound indexes to existing tables. This will require running `npx prisma db push` to synchronize your database schema.

## Open Questions

1. **Rate Limiting:** Since we are skipping Redis, I will implement a basic in-memory LRU Map inside a custom `src/middleware.ts` to limit requests by IP address. Note that in a serverless environment (like Vercel), this memory is cleared on cold starts, meaning it provides *basic* but not absolute throttling. Is this acceptable?
2. **Pagination:** Implementing cursor-based pagination for Vitals and Cycle logs will change the UX slightly (users might need to click "Load More" to see data older than a few months). Are you okay with this UX change?

---

## Proposed Changes

### Security

#### [NEW] `src/lib/encryption.ts`
- Implement AES-256-GCM encryption and decryption utilities using Node's standard `crypto` module.

#### [MODIFY] `src/middleware.ts` (or [NEW] if it doesn't exist)
- Add a custom in-memory rate limiter using a Javascript `Map` to track IP request counts over a 1-minute sliding window.
- Apply rate limiting primarily to `/api/auth/` and `/api/logs/` routes.

#### [MODIFY] `next.config.js`
- Inject strict HTTP Security Headers:
  - `Content-Security-Policy` (CSP)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Strict-Transport-Security` (HSTS)

#### [MODIFY] `prisma/schema.prisma`
- Add the `AuditLog` model to track who modified what data and when.
- Add `@@index` to `PinkBook` (`userId`) and `ClinicEdge` (`fromId`, `toId`) for query performance.

#### [MODIFY] API Routes (`src/app/api/...`)
- Update `api/logs/vitals/route.ts` and `api/logs/cycle/route.ts`:
  - On `POST` and `PUT`, stringify and encrypt the payload before saving it to Prisma.
  - On `GET`, decrypt the payload before sending it to the client.
  - Log an `AuditLog` entry on `POST`, `PUT`, and `DELETE`.

#### [MODIFY] `src/lib/auth.ts`
- Enforce `useSecureCookies: process.env.NODE_ENV === 'production'`.

---

### Performance

#### [MODIFY] `src/app/page.tsx` (and other heavy pages)
- Use Next.js `next/dynamic` to lazy-load heavy client components like `HealthCharts`, `MenstrualTracker`, and `VitalLogger`. This drastically reduces the initial JavaScript bundle size, allowing the dashboard to render instantly while charts load in the background.

#### [MODIFY] `src/store/useHealthStore.ts` & API Routes
- Refactor data fetching for `getVitalLogs` to support pagination (`?page=1&limit=20`) instead of pulling the entire history at once.
- Introduce a `loadMoreVitals` function in the store.

#### [MODIFY] `src/app/api/community/network-mst/route.ts`
- Optimize the Kruskal algorithm implementation by ensuring the graph nodes and edges are cached in-memory on the Node server if they don't change often. (We cannot use Edge runtime directly here as standard Prisma client does not support Edge without Prisma Accelerate).

---

## Verification Plan

### Automated / Build
- Run `npx next build` to ensure the dynamic imports, encryption logic, and middleware compile correctly without TypeScript errors.
- Run `npx prisma format` and `npx prisma validate` on the updated schema.

### Manual Verification
- Test creating, editing, and deleting a vital log.
- Verify in the database (via Prisma Studio) that the saved `value` is an encrypted string and an `AuditLog` entry was created.
- Verify that the dashboard loads the charts dynamically without crashing.
- Inspect the Network tab to ensure the new security headers are present on document requests.

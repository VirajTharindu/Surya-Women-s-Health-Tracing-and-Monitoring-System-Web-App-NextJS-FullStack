# Engineering Decisions

This document outlines the core technical decisions made during the development of the Suriya Women's Health Tracking system, focusing on algorithmic choices, security, and performance optimizations.

## 1. Algorithmic Implementations (`src/lib/algorithms/`)

### Priority Queue for Reminders
**Decision:** We utilized a custom Priority Queue (`PriorityQueue.ts`) for managing health reminders.
**Rationale:** Standard chronological sorting is insufficient for healthcare. A priority queue ensures that critical alerts (e.g., missed medication, abnormal vital signs) surface to the top of the user's feed before less urgent notifications (e.g., general checkup reminders).

### Sorting Algorithms (Merge Sort)
**Decision:** While JavaScript's native `.sort()` is sufficient for small arrays, we explicitly implemented Merge Sort for analyzing extensive historical health logs.
**Rationale:** Merge Sort guarantees O(n log n) time complexity, providing predictable performance when sorting years of daily vital logs across large user cohorts on the backend.

## 2. Security & Data Privacy

### AES-256-GCM Encryption
**Decision:** We implemented application-level AES-256-GCM encryption (`encryption.ts`) for highly sensitive health data before it is persisted to the database.
**Rationale:** Health data requires strict privacy controls. Even if the database is compromised, the data remains unreadable without the application-layer encryption keys.

### Middleware Rate Limiting & Security Headers
**Decision:** A custom rate limiter was implemented directly in Next.js Middleware (`middleware.ts`).
**Rationale:** Protects the authentication and API routes from brute-force attacks and DDoS attempts. Strict security headers (CSP, XSS Protection, Frame Options) were also added to mitigate client-side vulnerabilities.

## 3. Infrastructure & CI/CD

### Next.js Standalone Build
**Decision:** Configured Next.js to use `output: 'standalone'`.
**Rationale:** This drastically reduces the Docker image size by tracing dependencies and only including the necessary files in the final production container, resulting in faster deployments and lower memory footprints.

### Multi-Stage Docker Builds & GitHub Actions
**Decision:** Implemented a multi-stage Dockerfile utilizing `node:24-alpine` and integrated it with a comprehensive GitHub Actions workflow (`ci.yml`).
**Rationale:** Ensures consistent environments across development, testing, and production. The CI pipeline enforces testing (Jest/Playwright) and static analysis before any code is pushed to the Docker registry or deployed to Vercel.

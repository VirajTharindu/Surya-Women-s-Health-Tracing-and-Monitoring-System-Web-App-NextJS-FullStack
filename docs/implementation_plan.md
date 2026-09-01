# Surya Women's Health System - Backend Development Plan

Currently, the Surya Women's Health System is a **pure frontend application**. All state management (Logs, Pink Book, Reminders, Graph Algorithms) relies entirely on client-side memory using `Zustand` and custom data structures (`DoublyLinkedList`, `PriorityQueue`, `Tree`). 

To elevate this to a production-ready, full-stack application, we must implement a robust, secure, and scalable backend. Below is the Associate Software Engineer (ASE) level technical proposal for the backend architecture.

## 1. Tech Stack Selection

For a modern Next.js 15 application, the industry-standard backend stack is:

*   **Runtime:** Node.js (via Next.js App Router API Routes)
*   **Database:** PostgreSQL (Highly relational, ACID compliant, excellent for structured medical data)
*   **ORM:** Prisma (Type-safe database access, auto-generated migrations)
*   **Authentication:** NextAuth.js (Auth.js v5) with JWT strategy (supports credentials and OAuth)
*   **Validation:** Zod (for strict runtime request payload validation)

> [!TIP]
> **Why PostgreSQL + Prisma?** Health tracking requires complex relational queries (e.g., querying all Blood Pressure logs for a specific user over a 30-day window). A relational database with Prisma provides extreme type-safety, which prevents critical bugs in medical software.

---

## 2. Database Schema Design (Prisma)

The state currently held in `useHealthStore` will be normalized into the following relational schema.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  MIDWIFE // PHI Officer
  ADMIN
}

model User {
  id             String    @id @default(cuid())
  email          String    @unique
  passwordHash   String
  role           Role      @default(USER)
  
  // Profile
  name           String
  dob            DateTime
  heightCm       Float
  location       String
  languagePref   String    @default("en")

  // Relations
  cycleLogs      CycleLog[]
  vitalLogs      VitalLog[]
  reminders      Reminder[]
  pinkBook       PinkBook?
  
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model CycleLog {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date          DateTime
  flowIntensity String   // 'spotting' | 'light' | 'medium' | 'heavy'
  cramps        Int      // 1-5
  mood          String
  symptoms      String[] // Array of symptoms
  note          String?

  @@index([userId, date])
}

model VitalLog {
  id                  String   @id @default(cuid())
  userId              String
  user                User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date                DateTime
  vitalType           String   // 'bp' | 'glucose' | 'weight'
  
  // Using JSONB for flexible vital data (or separate columns if strictly normalized)
  value               Json     
  
  classification      String
  classificationColor String

  @@index([userId, date])
}

model Reminder {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title       String
  description String?
  time        DateTime // The priority timestamp
  category    String
  isCompleted Boolean  @default(false)
}

// PinkBook and Clinic models will follow similar relational structures...
```

---

## 3. API Architecture (REST via Next.js Route Handlers)

We will build standard RESTful API routes in the `src/app/api/` directory.

### Core Endpoints
*   `POST /api/auth/register` - User registration.
*   `POST /api/auth/login` - Handled automatically by NextAuth.
*   `GET /api/user/profile` - Fetch current user profile & settings.
*   `GET /api/logs/cycle` - Retrieve menstrual logs (supports `?startDate` & `?endDate` filters).
*   `POST /api/logs/cycle` - Insert a new cycle log (validated via Zod).
*   `GET /api/logs/vitals` - Retrieve BP/Glucose/Weight logs.
*   `POST /api/logs/vitals` - Insert new vital reading.
*   `GET /api/reminders` - Fetch user reminders, ordered by `time ASC` (handled via SQL `ORDER BY`, replacing the client-side Priority Queue for persistent data, though we can still use the PriorityQueue in memory on the client for instant UI updates).

---

## 4. Algorithm Migration Strategy

Currently, algorithms are running synchronously in the client browser. For a production app:

1.  **Kruskal's Graph Algorithm (Midwife Network):**
    *   **Backend Move:** This requires access to the full `Clinics` table in the database.
    *   **Implementation:** Create a specialized route `GET /api/community/network-mst`. The backend will query the graph edges from the DB, run the Kruskal algorithm in Node.js, and return only the final Minimum Spanning Tree to the frontend.
2.  **Greedy Allocation Algorithm (Pharmacy):**
    *   **Backend Move:** Create `POST /api/community/allocate`. This will take the current available national stock, query the real-time `Demand` table across all registered clinics, run the Greedy Priority-First algorithm, and physically update the inventory rows in a single ACID Database Transaction.
3.  **Client-Side Data Structures:** 
    *   The `DoublyLinkedList` and `PriorityQueue` can remain in `useHealthStore` as **local caches**. The system will fetch from the API, populate the local structures, and benefit from the $O(1)$ insertions/deletions for optimistic UI updates before syncing back to the database.

---

## 5. Security & Data Privacy (Critical)

Handling Women's Health Data requires strict security measures.

> [!CAUTION]
> **Data Privacy:** Menstrual data, pregnancy status, and vital logs are highly sensitive Personally Identifiable Information (PII).

*   **Authentication:** All API routes (except registration) must wrap in `auth()` checks to ensure the user is logged in.
*   **Authorization (RBAC):** Users can only query `WHERE userId = session.user.id`. Midwives/PHI officers require the `MIDWIFE` role to access patient data, and this access must be explicitly granted by the User (as seen in the "Sync with PHI" UI toggle).
*   **Input Validation:** We will use `zod` schemas on every `POST`/`PUT` request to ensure no malformed data or injection attacks can penetrate the DB.
*   **Encryption:** Passwords hashed with `bcryptjs`. We should strongly consider Application-Level Encryption for the `note` and `value` fields in the `VitalLog` and `CycleLog` tables.

## User Review Required

Does this technical direction align with your expectations for the full-stack transformation? If approved, the next immediate steps would be setting up a local PostgreSQL Docker container, initializing Prisma, and building out the authentication layer.

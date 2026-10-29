# EduReach AI — Inclusive Education & Student Success Platform

> **AI-Powered Multimodal Educational Advisory & Accommodation Engine for Underserved Schools**

EduReach AI equips educators, school administrators, accessibility specialists, and community tutors with automated, evidence-based tools to:
1. **Identify Multidimensional Learning Barriers:** Attendance anomalies, reading/math velocity benchmark gaps, cognitive/sensory differences, and low-bandwidth/offline connectivity constraints.
2. **Generate Individualized, Disability-Inclusive Lesson Accommodations:** Powered by `@google/genai` (**Gemini 2.5 Flash**), generating Universal Design for Learning (UDL) adaptations, assistive tech strategies, and zero-bandwidth fallbacks conforming strictly to enforced JSON schemas.
3. **Assemble Targeted Intervention Pipelines:** Algorithmic scheduling of at-risk students into 1-on-1 peer tutoring sessions, assistive tech deployments, and coaching tracks.
4. **Monitor Longitudinal Academic Progress:** Structured telemetry tracking attendance fluctuations, math & reading velocity percentiles, and student well-being ratings over time.

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, DOMPurify.
- **Backend:** Node.js, Express.js, TypeScript, Zod request/response validation, Helmet, CORS, Morgan.
- **AI Orchestration:** Official `@google/genai` SDK using `gemini-2.5-flash` with strictly enforced `responseSchema` (Type.OBJECT) and system instructions.
- **Database & Auth:** Supabase PostgreSQL with native Row Level Security (RLS) policies and tenant isolation functions (`get_user_school_id()`).
- **Resilient Fallback Mode:** Operates out-of-the-box with a high-fidelity in-memory seed store and curated adaptive pedagogical engine when live Supabase or Gemini credentials are not yet provisioned.

---

## 📂 Repository Structure

```text
├── client/                      # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── advisory/        # AccommodationViewer & printable worksheets
│   │   │   ├── dashboard/       # TelemetryTrendChart (Recharts) & KPI summaries
│   │   │   ├── interventions/   # InterventionPipelineCard & milestone toggles
│   │   │   ├── layout/          # Navbar & WCAG 2.1 AA AccessibilityToolbar
│   │   │   └── students/        # StudentRosterTable, BarrierDiagnosticModal, TelemetryModal
│   │   ├── context/             # AuthContext (Role/Tenant switcher) & AccessibilityContext
│   │   ├── pages/               # 8 full application routes
│   │   ├── services/            # Type-safe API client
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── server/                      # Express + TypeScript backend API
│   ├── src/
│   │   ├── controllers/         # Student, Advisory, Intervention, Analytics, Auth
│   │   ├── lib/                 # Gemini 2.5 Flash SDK orchestrator & Supabase client
│   │   ├── middleware/          # JWT Auth, Role Guard, Zod validator & DOMPurify
│   │   ├── routes/              # Express API route modules
│   │   ├── services/            # Multi-tenant DataStoreService
│   │   └── index.ts
│   └── package.json
├── shared/                      # Monorepo shared contracts
│   ├── src/
│   │   ├── types.ts             # Domain models, enums & AI JSON schemas
│   │   ├── validators.ts        # Zod validation schemas
│   │   └── index.ts
│   └── package.json
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql  # Concrete PostgreSQL schema & indexes
        ├── 002_rls_policies.sql    # Row Level Security & school isolation rules
        └── 003_seed_data.sql       # High-fidelity test data across 2 schools
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js v18+ (tested on v24.21.0)
- npm or pnpm

### 2. Install & Build Monorepo

```bash
# 1. Install & build shared contracts
cd shared
npm install
npm run build
cd ..

# 2. Install & build backend server
cd server
npm install
npm run build
cd ..

# 3. Install & build frontend client
cd client
npm install
npm run build
cd ..
```

### 3. Environment Variables

Create `server/.env`:
```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Supabase PostgreSQL (Optional for local testing; in-memory seed store used automatically if absent)
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
SUPABASE_ANON_KEY=eyJhbGciOi...

# Google Gemini API Key for Gemini 2.5 Flash
GEMINI_API_KEY=AIzaSy...
```

Create `client/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://xyzcompany.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. Running the Application

In terminal 1 (Backend):
```bash
cd server
npm run dev
# Server binds to http://localhost:4000
```

In terminal 2 (Frontend):
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

---

## 🧪 Automated Verification Suite

Run the full end-to-end integration test suite verifying health checks, student intake, telemetry logging, Gemini AI accommodation generation, intervention scheduling, analytics, and multi-tenant isolation:

```bash
node test-e2e.cjs
```

---

## 👥 Demo Personas & Multi-Tenant Testing

The platform includes a **1-click Persona & School Switcher** in the top Accessibility Toolbar to instantly test role-based permissions and tenant boundaries:

| Persona | Role | School | Connectivity Mode | Purpose |
|---|---|---|---|---|
| **Dr. Eleanor Vance** | Administrator | Oakridge Inclusive Academy | High Bandwidth | Institutional overview & full roster management |
| **Marcus Chen, M.Ed.** | Educator | Oakridge Inclusive Academy | High Bandwidth | Barrier diagnostics, AI accommodations, telemetry |
| **Sarah Jenkins, BCBA** | Specialist | Oakridge Inclusive Academy | High Bandwidth | Behavior, sensory, and assistive tech interventions |
| **Alex Rivera** | Tutor | Oakridge Inclusive Academy | High Bandwidth | Remedial milestone check-ins & peer tutoring |
| **Robert Miller** | Educator | Crestview Frontier High | Low Bandwidth | Verifies multi-tenant isolation (cannot see Oakridge records) |

---

## ♿ WCAG 2.1 AA Accessibility Features

- **Font Size Scaling:** Instant toggle between `Normal (1rem)`, `Large (1.15rem)`, and `Extra Large (1.3rem)`.
- **High Contrast Mode:** Pure black (`#000000`) high-contrast palette with vivid accessible borders (`#ffffff`) and gold focus highlights (`#facc15`).
- **Low-Bandwidth / Zero-Data Mode:** Strips heavy media, disables non-essential gradients, and prioritizes lightweight, printer-friendly text packet layouts.
- **Screen Reader Support:** Semantic HTML5 (`<main>`, `<nav>`, `<aside>`), ARIA live regions (`aria-live="polite"`), and explicit skip-to-content links.
- **Printable Accommodations:** High-contrast, clean printable view for distributing offline study packets in rural/low-connectivity environments.

---

## 🔒 Security & Data Minimization

1. **Zero Client-Side AI API Access:** All calls to Google Gemini route strictly through secured Express controllers with JWT verification.
2. **Data Minimization:** Student names and direct identifiers are anonymized before building prompt context sent to Gemini endpoints.
3. **Multi-Tenant Isolation:** Enforced at both the database level via PostgreSQL Row Level Security (RLS) policies and in the application data layer.
4. **Input Sanitization:** Rich text and educator notes are sanitized using `isomorphic-dompurify` to prevent stored XSS attacks.


# CareConnect (Chennai) — Elder Care Platform

CareConnect is a managed elder-care platform connecting **Family / Primary Sponsors**, **Caregivers / Attendants**, and **Operations / Care Managers** in Chennai, Tamil Nadu.

This repository implements **Phase A: Onboarding & Clinical/Lifestyle Intake**:
- **Phase A.1**: Sign-Up & Geographic Verification (WhatsApp OTP, Google Sign-In, Chennai corridor serviceability validation).
- **Phase A.2**: Patient Persona Configuration (10-step intake wizard covering mobility, clinical requirements, dietary needs, languages, lifestyle routines, shift preferences, and review-with-direct-edit).
- **Phase A.3**: Home Assessment Booking (Clinical Care Manager home visit scheduling using verified elder address snapshot).

---

## Architecture Overview

```
                      ┌───────────────────────────────────────┐
                      │    React + Vite + Tailwind Frontend   │
                      │    (Sponsor Portal & 10-Step Wizard)  │
                      └──────────────────┬────────────────────┘
                                         │ REST API
                      ┌──────────────────▼────────────────────┐
                      │            FastAPI Backend            │
                      │  - JWT Bearer Auth & Roles            │
                      │  - Chennai GeoService (PostGIS/Grid)  │
                      │  - Persona State Machine Engine       │
                      │  - Home Assessment Booking Engine     │
                      └──────────────────┬────────────────────┘
                                         │ Async SQLAlchemy 2.0
                      ┌──────────────────▼────────────────────┐
                      │    PostgreSQL + PostGIS / SQLite      │
                      │  - Users (Family Sponsors)            │
                      │  - Elders (Intake Persona)            │
                      │  - ElderLocations (Chennai Corridors) │
                      │  - HomeAssessmentRequests             │
                      └───────────────────────────────────────┘
```

---

## Quick Start

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Install dependencies
python -m pip install -r requirements.txt

# Run automated tests
python -m pytest

# Start development server
uvicorn app.main:app --reload --port 8000
```

The API will be live at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

### 2. Frontend Setup (React + Vite + TypeScript)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will run at `http://localhost:5173`.

---

## Key Features & Compliance

1. **WhatsApp OTP & Google Sign-In**:
   - Built with self-issued JWTs (`HS256`), rate-limiting (max 5 OTP sends/hour, 5 failed verify lockouts).
   - In dev/test environments, deterministic OTP `123456` is enabled for rapid testing.
2. **Server-Side Geographic Verification**:
   - Backend evaluates Chennai coverage corridors (Adyar, Besant Nagar, T. Nagar, Anna Nagar, Mylapore, Velachery, OMR, etc.) and valid PIN codes (`600001`–`600135`).
   - Returns canonical states: `VERIFIED`, `NOT_SERVICEABLE`, `INVALID_ADDRESS`, `UNABLE_TO_VERIFY`, `PERMISSION_DENIED`.
   - Never trusts client-supplied `serviceable=True`.
3. **Structured Patient Persona**:
   - Captures non-diagnostic, family-supplied observations: Mobility levels, medical conditions, devices, dietary preferences, primary and secondary languages, daily routine, and shift choices (8-hr Day, 12-hr Day/Night, 24-hr Live-in).
   - Edit-from-review functionality allows instant navigation to modify any section before final submission.
4. **Clinical Home Assessment Booking**:
   - Optional recommended step capturing a frozen snapshot of the verified address with appointment date and time slot.
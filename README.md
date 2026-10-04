# Aldergate Clinic

> Online doctor appointment booking with persistent patient consultation history — built with React, Spring Boot, and MongoDB.

Aldergate Clinic is a full-stack clinic management system with three roles — **Patient**, **Doctor**, and **Admin** — covering the complete care loop: a patient books an appointment, the doctor sees it, opens the patient's prior history, consults, and records a new consultation that persists to the next visit.

**The consultation history is the core of this product.** Booking is the entry point; the persistent medical record is what the project is judged on.

---

## ✨ Features

**Patients**
- Self-registration with JWT-based auth
- Browse / search / filter doctors by specialization
- Doctor profiles with availability, fee, languages, and room
- 3-step booking flow: Doctor → Date → Time Slot → Confirm
- Graceful 409 handling when a slot is taken mid-flow
- Upcoming + past appointments, cancellation (soft-delete)
- Profile management

**Doctors**
- Dashboard with today's + upcoming appointments
- Confirm / complete / cancel appointments (Pending → Confirmed → Completed / Cancelled)
- Patient list scoped to doctors with a real appointment relationship
- Full consultation history per patient (reverse-chronological, scannable mid-consultation)
- Add consultation records: symptoms, diagnosis, prescription, notes, follow-up

**Admin**
- Seeded operator account
- Create doctor accounts (doctors cannot self-register — deliberate access-control decision)
- Doctor roster

**Platform**
- Role-based access enforced on the **backend**, not just the UI
- Slot double-booking prevented by a partial unique index (not check-then-insert)
- Responsive across desktop / tablet / mobile
- Loading, empty, and error states on every list; status never carried by color alone

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Vite 8, CSS Modules, Phosphor Icons |
| Backend | Java 21, Spring Boot 3.5, Spring Security + JWT, Spring Data MongoDB, Lombok, Bean Validation |
| Database | MongoDB (Atlas cluster via `MONGODB_URI`) |
| Auth | Stateless JWT (`Authorization: Bearer <token>`), BCrypt password hashing |
| Tooling | Maven Wrapper, Oxlint, Git |

**Architecture:** `Controller → Service → Repository` on the backend. One `fetch` wrapper (`frontend/src/services/api.js`) + React Context for auth on the frontend. No Redux, no Axios, no React Query — deliberately minimal.

---

## 📁 Project Structure

```
aldergate-clinic-management/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Public/        # Home, About
│   │   │   ├── Auth/          # SignIn, SignUp
│   │   │   ├── Patient/       # Dashboard, Doctors, DoctorDetails, BookAppointment, Appointments, Profile
│   │   │   ├── Doctor/        # Dashboard, Appointments, Patients, PatientHistory, AddConsultation, Profile
│   │   │   ├── Admin/         # DoctorRoster, AddDoctor
│   │   │   └── Navbar, PrivateRoute, ErrorBoundary, LoadingSpinner
│   │   ├── data/              # Clinic constants + placeholder content
│   │   ├── services/api.js    # Single fetch wrapper for all API calls
│   │   ├── state/             # AuthContext
│   │   ├── App.jsx            # All 19 routes
│   │   └── index.css          # Design tokens (source of truth — see DESIGN.md)
│   └── vite.config.js         # /api → http://localhost:8080 proxy
├── backend/                   # Spring Boot API
│   └── src/main/java/com/aldergate/clinic/
│       ├── controller/        # Auth, Doctor, Patient, Appointment, MedicalRecord, Admin
│       ├── service/           # Business rules + authorization
│       ├── repository/        # Spring Data Mongo repositories
│       ├── model/             # User, Doctor, Patient, Appointment, MedicalRecord, Availability
│       ├── dto/               # Request/response shapes (exact per api-contract.md)
│       ├── security/          # JwtUtil, JwtAuthFilter, SecurityConfig
│       └── exception/         # GlobalExceptionHandler + typed errors
├── api-contract.md            # Single source of truth for every endpoint
├── PRODUCT.md                 # Product spec, users, scope, principles
├── DESIGN.md                  # Design system + accessibility rules
├── IMPLEMENTATION_PLAN.md     # Build phases + decisions
└── README.md                  # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Java** 21+
- **MongoDB** — Atlas cluster connection string (no localhost fallback by design; a missing `MONGODB_URI` fails startup instead of silently using the wrong database)

### 1. Clone

```bash
git clone https://github.com/parth2029-glitch/aldergate-clinic-management.git
cd aldergate-clinic-management
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env and set real values:
#   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/aldergate
#   JWT_SECRET=<at-least-32-characters-long-random-secret>
```

Run:

```bash
# Windows
.\mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

API is live at **`http://localhost:8080`**.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App is live at **`http://localhost:5173`** (API calls proxy to `:8080` — no CORS config needed in dev).

### 4. Seed accounts (dev)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@aldergate.clinic` | `Admin@123` |
| Doctor | `ananya.raghunathan@aldergate.clinic` | `Doctor@123` |
| Patient | `n.fernandes@example.com` | `Patient@123` |

All doctors follow `firstname.lastname@aldergate.clinic` / `Doctor@123`. Backend seeds these on the `dev` profile.

---

## 🔑 Key Workflows

**Booking (Patient):** Doctors list → Doctor details → pick date → pick slot → confirm. If another patient takes the slot mid-flow, the API returns `409` and the UI refreshes slots in place.

**Consultation (Doctor, the core loop):** Dashboard → appointment → open patient profile → prior history displays → consult → add record (symptoms / diagnosis / prescription / notes / follow-up) → stored in MongoDB → visible at the next visit.

**Appointment states:** `Pending → Confirmed → Completed`, with `Cancelled` reachable from Pending/Confirmed by either the patient or the doctor on the appointment.

---

## 🔌 API Overview

Base URL: `http://localhost:8080`. Full request/response shapes in [`api-contract.md`](./api-contract.md).

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` |
| Doctors | `GET /api/doctors?specialization=` · `GET /api/doctors/{id}` · `GET /api/doctors/{id}/slots?date=` · `PUT /api/doctors/me` |
| Patients | `GET /api/patients/{id}` · `PUT /api/patients/me` |
| Appointments | `POST /api/appointments` · `GET /api/appointments/mine` · `GET /api/appointments/doctor` · `PATCH /api/appointments/{id}/status` · `DELETE /api/appointments/{id}` |
| Records | `GET /api/medical-records/patient/{patientId}` · `POST /api/medical-records` |
| Admin | `POST /api/admin/doctors` · `GET /api/admin/doctors` |

Error shape for all non-2xx responses:

```json
{ "error": "Short name", "message": "Human-readable detail", "status": 404 }
```

---

## 🔒 Security Notes

- Passwords hashed with `BCryptPasswordEncoder` — never plain text.
- Every protected route checks the JWT subject against the resource owner; a patient can never read another patient's records, and a doctor can only read records for patients they have an appointment with.
- Doctors are admin-created only. Patient self-registration can never mint `DOCTOR` or `ADMIN` roles (DTO-bound, never entity-bound).
- `JWT_SECRET` and `MONGODB_URI` come from `backend/.env` / environment — no secrets in git history.

---

## 🧪 Scripts & Tests

```bash
# frontend/
npm run dev      # Vite dev server
npm run build    # Production build → frontend/dist/
npm run preview  # Preview production build
npm run lint     # Oxlint

# backend/
.\mvnw.cmd test              # All tests (incl. booking-concurrency + record-authorization)
.\mvnw.cmd spring-boot:run   # Dev server on :8080
```

Notable backend tests: `BookingConcurrencyTest` (proves the unique index blocks double-booking) and `MedicalRecordAuthorizationTest` (proves cross-patient/unauthorized-doctor reads return 403).

---

## 🎨 Design

Warm paper ground (`#faf9f7`) + one deep emerald accent (`#0d5f45`), hairline-divided rows instead of card grids, monogram avatars instead of stock faces. All tokens live in `frontend/src/index.css`. Status is always icon + word + hue, text contrast floors at 4.82:1, and keyboard focus is always visible. See [`DESIGN.md`](./DESIGN.md) for the full system and its one known gap.

---

## 📚 Docs

- [`api-contract.md`](./api-contract.md) — every endpoint, exact field names (frontend destructures them as written)
- [`PRODUCT.md`](./PRODUCT.md) — users, scope, constraints, product principles
- [`DESIGN.md`](./DESIGN.md) — visual system, tokens, accessibility rules
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — backend-first plan, slot-collision and authz risk analysis

---

## ⚠️ Disclaimer

Coursework project. All doctors, patients, and medical records in seeds and screenshots are **invented and intentionally fictional** — no real practitioners, credentials, testimonials, ratings, or statistics anywhere in the app.

---

## 📄 License

MIT — see `LICENSE` if present. Built as a college full-stack project with React, Spring Boot, and MongoDB.


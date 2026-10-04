# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Fixed by the PRD (§14), not delegated:

- Frontend: React.js, JavaScript/JSX, Vite, CSS / CSS Modules
- Backend: Java, Spring Boot, REST, Controller → Service → Repository
- Database: MongoDB via Spring Data MongoDB
- Auth: backend authentication + protected frontend routes
- Tooling: Git/GitHub, ESLint

No scaffold exists yet. The repository currently holds only the PRD, a planning document, and agent config.

Build order is **frontend first, backend second** — the user's explicit sequencing decision, made 2026-08-13, reversing the backend-first plan in `IMPLEMENTATION_PLAN.md`. The immediate task is static pages with no API calls.

## Users

**Patients** — book and manage their own appointments. Register themselves. Browse doctors by specialization, view availability, book a slot, view upcoming and past appointments, cancel. Likely on a phone or a personal laptop, unhurried, outside a clinical setting.

**Doctors** — run their day from a dashboard. See today's and upcoming appointments, open a patient's file, read prior consultation history, and record a new consultation (symptoms, diagnosis, prescription, notes, follow-up). Working *during or between consultations*, with a patient present and limited attention to spare.

**Admin** — a single seeded operator whose only job is creating doctor accounts. Not a persona with goals; an access-control mechanism. Confirmed 2026-08-13.

## Product Purpose

Let patients book doctor appointments online, and give doctors a consultation record that persists between visits.

Success is the loop closing: a patient books, the doctor sees the appointment, opens the patient's history, consults, adds a record — and that record is waiting at the next visit. An appointment booker without the history is a different, lesser product.

## Positioning

The connection between appointment management and persistent patient medical history (PRD §16). Scheduling and record-keeping are one system, so the doctor arrives at every consultation already holding the prior one.

This is a college project (confirmed 2026-08-13). It is not competing with anything; "positioning" here means the feature the build is judged on. Work that polishes booking while leaving history thin has optimized the wrong half.

## Operating Context

- **Booking flow:** Doctor → Date → Available Time Slot → Confirm (PRD §4.4). Two patients must never hold the same slot.
- **Consultation flow (PRD §5, the core loop):** patient books → doctor views appointment → doctor opens patient profile → prior history displays → consultation happens → doctor adds a record → stored in MongoDB → available at the next visit.
- **Reading conditions:** medical history is read mid-consultation with a patient in the room. PRD §11 requires it be "easy for doctors to scan quickly." That is a stated product requirement, not a preference.
- **Appointment states:** Pending, Confirmed, Completed, Cancelled. These appear across nearly every screen in both roles.
- Open: who moves an appointment Pending → Confirmed. The PRD names the states, not the actor.

## Capabilities and Constraints

**Confirmed in scope** — auth with role-based access; patient registration; doctor browse/search/filter by specialization; doctor availability; appointment booking, viewing, and cancellation; doctor dashboard; patient medical history read and write; admin creation of doctor accounts.

**Confirmed out of scope (PRD §12)** — payments, video consultation, AI diagnosis, pharmacy/delivery, insurance, hospital management, real-time chat, wearables.

**Deferred (PRD §13)** — reminders, prescription PDFs, ratings, advanced scheduling, analytics, a full admin dashboard.

**Constraints that bind future work:**

- Passwords are never stored in plain text; role access is enforced on the backend, not only in the UI (PRD §11).
- A patient can never reach another patient's records. A doctor reaches only records they are authorized to view.
- Doctors are created by the admin only — patients self-register, doctors do not (confirmed 2026-08-13). This departs from PRD §3, which implies doctor self-service, and closes the hole where anyone could register as a doctor and read patient histories.
- Admin scope is deliberately two pages: add a doctor, list doctors. No stats, no patient management, no appointment oversight. Anything more contradicts PRD §13's deferral of the admin dashboard.
- Responsive across desktop, tablet, and mobile (PRD §11).
- Loading and error states are required, not optional (PRD §11).

**Previously open, now decided (2026-08) and reflected in `api-contract.md`:** the
clinic is **Aldergate Clinic**; the doctor on an appointment is the actor who moves
it Pending → Confirmed; and doctors **can** cancel a Pending or Confirmed
appointment, not only patients.

## Brand Commitments

None. No existing name, logo, voice, or identity constraint — this product has never existed.

Placeholder content is explicitly authorized (confirmed 2026-08-13) on one condition: it must read as obviously fictional. Invented doctor names, specialties, and a made-up clinic name are fine. Anything that could be mistaken for real medical information, real practitioners, or real credentials is not.

## Evidence on Hand

**Nothing.** No real clinic, no real doctors, no users, no testimonials, no case studies, no metrics, no press, no logo, no photography, no partner or certification marks.

Future work must not manufacture any of these as if real. Specifically off-limits: patient testimonials, "trusted by N clinics" style claims, doctor credentials or license numbers, accreditation badges, star ratings, and usage statistics. If a page seems to need social proof, the honest answer is that this product does not have any yet — not a plausible-looking invention.

The only source material is `Doctor_Appointment_Patient_Management_PRD.docx` at the project root.

## Product Principles

1. **The history is the product.** Booking is the entry point; persistent consultation records are what the project is judged on. When effort must be split, history wins.
2. **Doctors are reading under load.** A doctor scanning history mid-consultation needs the last visit at a glance. Density and scanability beat completeness of display.
3. **Enforce access at the backend, always.** Hidden UI is not access control. Every protection stated in PRD §11 lives in the API; the frontend only reflects it.
4. **Placeholder, never plausible.** Fabricated medical content is a real-world harm even in a college project. Fake data stays visibly fake.
5. **The PRD is the spec; departures are recorded.** Two exist so far — admin-created doctors, and frontend-first build order. Both are noted above. Future deviations get the same treatment rather than quiet drift.

## Accessibility & Inclusion

No formal standard (WCAG level or equivalent) has been established for this project.

Confirmed product-specific requirements, both from PRD §11: responsive across desktop, tablet, and mobile; and clear appointment status indicators. The four states carry real meaning — a Cancelled appointment misread as Confirmed is a missed consultation — so status must remain distinguishable to someone who cannot separate the colors.

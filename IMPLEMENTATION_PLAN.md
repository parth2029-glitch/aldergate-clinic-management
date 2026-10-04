# Implementation Plan — Doctor Appointment & Patient Management System

Source: `Doctor_Appointment_Patient_Management_PRD.docx`
Two phases: **Phase 1 = Backend** (Spring Boot + MongoDB), **Phase 2 = Frontend** (React + Vite).

**Why backend first:** the frontend is fully determined by the API contract. Build it second and you write every screen once; build it first and you write it twice — once against mocks, once against reality. The one exception is Step 1.0 below: lock the contract on day one so screens can be sketched in parallel if you want.

---

## Decisions locked before writing code

These are the choices the PRD leaves open. Each one is load-bearing.

| Area | Decision | Why |
|---|---|---|
| Java / Spring | Java 21 LTS, Spring Boot 3.5.x, generated from start.spring.io | Boot 3 requires 17+; let the initializr pin versions rather than hand-writing a POM |
| Auth | Spring Security + BCrypt + **JWT** (stateless) | Vite dev server runs on a different origin than the API. Session cookies drag in CORS credentials + SameSite config; JWT avoids all of it |
| Password hashing | `BCryptPasswordEncoder` — never hand-rolled | Trust boundary. PRD §11 requires it |
| Slot collisions | **Partial unique index**, not check-then-insert | See Step 1.4 — this is the single highest-risk item in the build |
| Cancellation | Soft-delete (`status=CANCELLED`, `active=false`) | PRD §4.5 requires viewing past appointments; a hard delete destroys history |
| Frontend state | React Context for auth + local component state | No Redux. Nothing here is shared deeply enough to earn it |
| Frontend data | One `fetch` wrapper in `services/api.js` | No React Query / Axios. ~40 lines covers every call in this app |
| Mongo topology | Standalone `mongod` (or Atlas free tier) | The index-based booking design deliberately needs **no** multi-document transactions, so no replica set required |

**Deliberately following the PRD even though it's more work:** §8 specifies three collections (`users`, `doctors`, `patients`) linked by `userId`. One `users` collection with a role field and an embedded profile subdocument would be simpler and cut two lookups on every request. The PRD is the spec — building it as written. Say the word if you'd rather collapse it.

---

# PHASE 1 — Backend

## 1.0 — Lock the API contract (do this first, it unblocks everything)

Write `api-contract.md` at the repo root: every endpoint from PRD §9 with its exact request body, response body, and status codes. Nothing else in either phase starts until this file exists.

**Gaps in PRD §9 that this step must resolve** — the listed endpoints don't cover the listed UI pages:

| Missing | Needed by | Add |
|---|---|---|
| Current-user lookup | Page refresh with a stored token | `GET /api/auth/me` |
| Patient detail fetch | Doctor Pages → "Patient Details" (§10) | `GET /api/patients/{id}` |
| Profile update | Patient Pages → "Profile", Doctor Pages → "Doctor Profile" (§10) | `PUT /api/patients/me`, `PUT /api/doctors/me` |
| Specialty filter | §4.3 "filter doctors by specialization" | `GET /api/doctors?specialization=` |
| Doctor's own record list | §4.7 medical history view | `GET /api/medical-records/patient/{id}` already covers it — confirm authz rule |

**Also decide here:** `DELETE /api/appointments/{id}` is a *cancel*, not a delete. Document it as such so nobody wires it to `repository.delete()` later.

## 1.1 — Project skeleton

Generate from start.spring.io with: `web`, `data-mongodb`, `security`, `validation`, `lombok`.
Add `jjwt-api` / `jjwt-impl` / `jjwt-jackson` for tokens.

Package layout exactly as PRD §7. Add `application.yml` with the Mongo URI and a JWT secret pulled from an env var — never a literal in the repo.

**DoD:** `./mvnw spring-boot:run` starts clean and connects to Mongo.

## 1.2 — Entities and repositories

Five `@Document` classes per PRD §8: `User`, `Doctor`, `Patient`, `Appointment`, `MedicalRecord`.

Two additions the PRD schema doesn't name but the logic requires:

- `Appointment.active` (boolean) — true for Pending/Confirmed/Completed, false for Cancelled. Exists purely to drive the unique index in 1.4.
- `Doctor.availability` needs a concrete shape. Use a weekly recurring template:
  ```
  availability: {
    slotMinutes: 30,
    weekly: { MONDAY: [{start:"09:00", end:"13:00"}], TUESDAY: [...] }
  }
  ```
  Free slots for a given date are *computed*, not stored — expand the template for that weekday, subtract booked appointments. Storing materialized slots means a nightly job and a whole class of drift bugs.

Repositories: `MongoRepository` with derived query methods. No custom `@Query` needed at this stage.

**DoD:** entities round-trip through Mongo in a scratch test.

## 1.3 — Auth (Steps 1.3 → 1.5 are the real backend)

- `AuthService.register()` — hash with BCrypt, create the `User` **and** the matching `Doctor`/`Patient` profile in one service call.
- `AuthService.login()` — verify, issue JWT carrying `userId` + `role`.
- `JwtAuthFilter extends OncePerRequestFilter` — parse the header, populate `SecurityContext`.
- `SecurityConfig` — stateless session, `permitAll` on `/api/auth/**` and `GET /api/doctors/**`, everything else authenticated. CORS allowing `http://localhost:5173`.

**Do not** put role checks in controllers. Use `@PreAuthorize("hasRole('DOCTOR')")` on service methods so every caller inherits the check.

**DoD:** register → login → call a protected endpoint with the token, and get 401 without it.

## 1.4 — Booking, and the slot race

This is where naive implementations break. "Check if the slot is free, then insert" is a race: two requests both read *free*, both insert, both succeed. It fails rarely in testing and constantly in a demo.

The fix is a database constraint, not application code:

```javascript
db.appointments.createIndex(
  { doctorId: 1, appointmentDate: 1, appointmentTime: 1 },
  { unique: true, partialFilterExpression: { active: { $eq: true } } }
)
```

Then `AppointmentService.book()` simply inserts and catches `DuplicateKeyException` → 409 Conflict. The database arbitrates; no locks, no transactions, correct under any concurrency.

> Note on the partial filter: Mongo's `partialFilterExpression` accepts only `$eq`, `$exists`, `$gt/$gte/$lt/$lte`, `$type`, `$and` — **`$ne` is not allowed**. That's exactly why `active` is a boolean rather than filtering on `status != 'CANCELLED'` directly. Cancelling flips `active` to false, which drops the row out of the index and frees the slot for rebooking.

Create the index via `@CompoundIndex` on the entity plus `auto-index-creation: true`, or an explicit `MongoTemplate` call at startup. Verify it exists — a silently-missing index means the guard isn't there.

Remaining booking rules: reject past dates, reject slots outside the doctor's availability template, default status `PENDING`.

**The one test that matters here:** fire ~20 concurrent bookings at the same slot from a thread pool, assert exactly one 201 and the rest 409.

## 1.5 — Medical records and the authorization rule

PRD §11: *"Doctors should only access records they are authorized to view."* That needs a concrete rule. Use:

> A doctor may read a patient's medical records **only if that doctor has at least one appointment with that patient.** A patient may read only their own.

Enforce it in `MedicalRecordService`, once, at the top of every read path. Not in the controller — the doctor dashboard, the history page, and the appointment detail view all reach the same data by different routes, and a controller-level check protects only the route you remembered.

Same rule shape for appointments: `GET /api/appointments/patient/{patientId}` takes an ID in the URL, so an authenticated patient could swap in someone else's. Keep the route for PRD compliance, but compare the path ID against the JWT's `userId` and 403 on mismatch.

**The second test that matters:** doctor B requests doctor A's patient's records → 403.

## 1.6 — Cross-cutting

- `@RestControllerAdvice` mapping exceptions to clean JSON errors (404 / 409 / 403 / 400 with field-level validation messages).
- `@Valid` + Jakarta constraints on every DTO. Never bind request bodies straight to entities — that's how a client sets its own `role`.
- DTOs that omit `password` from every response.

## 1.7 — Seed data

A `CommandLineRunner` (behind a `dev` profile) inserting ~8 doctors across specializations with availability templates, plus a demo patient. Without this, Phase 2 has nothing to render and you'll build the doctor list against an empty array.

## Phase 1 — Definition of Done

Every endpoint in `api-contract.md` returns real data, verified by hand (curl / Postman / an `.http` file), with:
- concurrent-booking test passing,
- cross-doctor record access returning 403,
- no plaintext password anywhere in Mongo,
- seed data present.

---

# PHASE 2 — Frontend

Component structure exactly as PRD §6. Build in the order below — it's roughly dependency order, and each step leaves the app runnable.

## 2.1 — Scaffold

`npm create vite@latest -- --template react`, add `react-router-dom`, configure ESLint (PRD §14).

Set a Vite dev proxy for `/api` → `http://localhost:8080`. This makes the frontend same-origin in development, so CORS and cookie edge cases stop existing during the build.

## 2.2 — Service layer (`services/api.js`, `services/authService.js`)

One `request(path, options)` wrapper: attaches the JWT, sets JSON headers, throws a typed error on non-2xx, and returns parsed JSON. Every other call in the app is a two-line function over it.

On 401, clear the token and redirect to login — handled once, in the wrapper, not in forty `catch` blocks.

## 2.3 — Auth context, routing, `PrivateRoute`

- `AuthContext` holding `{user, token, login, logout}`, hydrating from `localStorage` on mount via `GET /api/auth/me`.
- `PrivateRoute` taking an optional `role` prop: unauthenticated → `/login`; wrong role → `/` (not a blank screen).
- Full route table in `App.jsx` covering all three page groups from PRD §10.

**Note on token storage:** `localStorage` is readable by any XSS on the page. It's the standard choice for a project of this shape and it's what the PRD's architecture implies — worth knowing the tradeoff rather than discovering it later. An httpOnly cookie is the hardened alternative and costs you the CORS work Step 2.1's proxy was avoiding.

## 2.4 — Shared shell

`Navbar` (role-aware links), `LoadingSpinner`, `ErrorBoundary`. Public pages: Home, About, Login, Registration.

Registration needs a role toggle, since patient and doctor sign-up collect different fields.

## 2.5 — Patient flow

`Doctors.jsx` (list + specialization filter) → `DoctorDetails.jsx` → `BookAppointment.jsx` → `Appointments.jsx` → `PatientDashboard.jsx`.

Build the booking screen as the three-step flow from PRD §4.4: Doctor → Date → Slot → Confirm.

**Handle the 409 explicitly.** Someone else taking the slot mid-flow is a normal outcome, not a crash: show "that slot was just taken", refresh the slot list, keep the user on the page. This is the frontend half of Step 1.4 and it's the detail that separates a working demo from an embarrassing one.

## 2.6 — Doctor flow

`DoctorDashboard.jsx` (today's + upcoming + stats) → `DoctorAppointments.jsx` (with status updates) → `Patients.jsx` → `PatientHistory.jsx`.

`PatientHistory.jsx` is the core feature (PRD §4.7) — give it the most design attention. It's a reverse-chronological consultation list, each entry showing date, symptoms, diagnosis, prescription, notes, follow-up. PRD §11 asks that it be *scannable*: collapsed cards showing date + diagnosis, expanding to full detail. A doctor reading it mid-consultation needs the last visit in one glance, not a wall of text.

Plus the "Add Consultation Record" form, reachable directly from an appointment.

## 2.7 — Styling and responsive pass

CSS Modules per component (PRD §6). A shared `index.css` holding CSS custom properties for color, spacing, and type scale — that's the whole design system this app needs.

Status indicators (Pending / Confirmed / Completed / Cancelled) need distinct, consistent treatment everywhere they appear — and must not rely on color alone.

Responsive breakpoints for desktop / tablet / mobile per PRD §11.

## 2.8 — States and errors

Loading, empty, and error states for every list. "No appointments yet" with a link to book beats an empty div. Verify `ErrorBoundary` actually catches by throwing on purpose once.

## Phase 2 — Definition of Done

The full PRD §15 workflow runs end to end in a browser: register → login → find doctor → book → doctor sees it → opens history → adds a consultation record → that record appears on the patient's next visit.

---

## Open questions for you

1. **Doctor sign-up** — self-service, or should doctor accounts be seeded/admin-created? PRD §3 says doctors "create and manage a professional profile", which implies self-service, but that means anyone can register as a doctor and read patient records. Fine for a course project; worth a deliberate answer.
2. **Appointment status transitions** — who moves Pending → Confirmed? PRD lists the statuses but not the actor. Assuming doctor-confirms unless told otherwise.
3. **Repo shape** — one repo with `/frontend` and `/backend`, or two? Assuming one, since the folder currently holds only the PRD.
4. **Collapse the three user collections into one?** (see the note under "Decisions locked"). Real simplification, but a deviation from PRD §8.

Proceeding on the stated assumptions unless you say otherwise.

## Risks, ranked

| Risk | Where | Mitigation |
|---|---|---|
| Slot double-booking under concurrency | 1.4 | Partial unique index + 409 handling. Do not defer this |
| Broken record authorization | 1.5 | Single service-layer rule, all read paths |
| Availability model drift | 1.2 | Compute slots from the template; never materialize |
| IDOR via path IDs | 1.5 | Compare path ID to JWT subject |
| Mass-assignment on register | 1.6 | DTOs, never bind entities directly |

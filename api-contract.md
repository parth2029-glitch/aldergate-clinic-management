# API Contract — Aldergate Clinic

Every endpoint the backend exposes. This is the single source of truth for
both the Spring Boot API and the React frontend. Field names in request/response
bodies are **exact** — the frontend will destructure them as written.

Base URL: `http://localhost:8080`

---

## Authentication

All authenticated endpoints expect:
```
Authorization: Bearer <jwt-token>
```

Roles: `PATIENT`, `DOCTOR`, `ADMIN`

---

## Error Shape

All non-2xx responses return:
```json
{
  "error": "Short error name",
  "message": "Human-readable detail",
  "status": 404
}
```

Validation errors (400) add a `fields` map:
```json
{
  "error": "Validation failed",
  "message": "One or more fields are invalid",
  "status": 400,
  "fields": {
    "email": "must not be blank",
    "password": "size must be between 6 and 2147483647"
  }
}
```

---

## Auth — `/api/auth`

### `POST /api/auth/register`
**Auth:** Public  
**Description:** Patient self-registration.

**Request:**
```json
{
  "email": "n.fernandes@example.com",
  "password": "Patient@123",
  "name": "Nadia Fernandes",
  "age": 34,
  "gender": "Female",
  "phone": "+91 98204 71336",
  "bloodGroup": "O+",
  "address": "12 Rosewood Lane, Bengaluru 560025"
}
```

**201 Created:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "6690...",
    "email": "n.fernandes@example.com",
    "name": "Nadia Fernandes",
    "role": "PATIENT",
    "profileId": "6690..."
  }
}
```

**400:** Validation errors  
**409:** Email already registered

---

### `POST /api/auth/login`
**Auth:** Public

**Request:**
```json
{
  "email": "n.fernandes@example.com",
  "password": "Patient@123"
}
```

**200 OK:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "6690...",
    "email": "n.fernandes@example.com",
    "name": "Nadia Fernandes",
    "role": "PATIENT",
    "profileId": "6690..."
  }
}
```

**401:** Invalid email or password

---

### `GET /api/auth/me`
**Auth:** Any authenticated user

**200 OK:**
```json
{
  "id": "6690...",
  "email": "n.fernandes@example.com",
  "name": "Nadia Fernandes",
  "role": "PATIENT",
  "profileId": "6690..."
}
```

---

## Doctors — `/api/doctors`

### `GET /api/doctors`
**Auth:** Public  
**Query params:** `specialization` (optional, e.g. `?specialization=Cardiology`)

**200 OK:**
```json
[
  {
    "id": "6690...",
    "userId": "6690...",
    "name": "Ananya Raghunathan",
    "specialization": "Cardiology",
    "qualification": "MD, DM Cardiology",
    "experience": 14,
    "fee": 900.0,
    "room": "2.14",
    "about": "Sees adults for arrhythmia...",
    "languages": ["English", "Kannada", "Tamil"],
    "availability": {
      "slotMinutes": 30,
      "weekly": {
        "MONDAY": [{"start": "09:00", "end": "13:00"}, {"start": "16:00", "end": "17:00"}],
        "TUESDAY": [{"start": "09:00", "end": "13:00"}, {"start": "16:00", "end": "17:00"}]
      }
    }
  }
]
```

---

### `GET /api/doctors/{id}`
**Auth:** Public

**200 OK:** Single doctor object (same shape as list item above)  
**404:** Doctor not found

---

### `GET /api/doctors/{id}/slots`
**Auth:** Public  
**Query params:** `date` (required, ISO date e.g. `2026-08-18`)

**200 OK:**
```json
{
  "date": "2026-08-18",
  "availableSlots": ["09:00", "09:30", "11:30", "12:00", "16:30"],
  "bookedSlots": ["10:00", "16:00"]
}
```

---

### `PUT /api/doctors/me`
**Auth:** DOCTOR

**Request:**
```json
{
  "about": "Updated bio text",
  "fee": 950.0,
  "room": "2.15",
  "languages": ["English", "Kannada"],
  "availability": { ... }
}
```

**200 OK:** Updated doctor object  
**404:** Doctor profile not found

---

### `GET /api/doctors/patients`
**Auth:** DOCTOR  
**Description:** Returns the roster of patients this doctor has seen (has at least one appointment with).

**200 OK:**
```json
[
  {
    "id": "6690...",
    "userId": "6690...",
    "name": "Nadia Fernandes",
    "age": 34,
    "gender": "Female",
    "email": "n.fernandes@example.com",
    "phone": "+91 98204 71336",
    "bloodGroup": "O+",
    "address": "12 Rosewood Lane, Bengaluru 560025",
    "registeredAt": "2024-03-19"
  }
]
```

---

## Patients — `/api/patients`

### `GET /api/patients/my`
**Auth:** PATIENT

**200 OK:** Patient object (same shape as roster item above)

---

### `PUT /api/patients/me`
**Auth:** PATIENT

**Request:**
```json
{
  "name": "Nadia Fernandes",
  "age": 35,
  "gender": "Female",
  "phone": "+91 98204 71336",
  "bloodGroup": "O+",
  "address": "14 Rosewood Lane, Bengaluru 560025"
}
```

**200 OK:** Updated patient object

---

### `GET /api/patients/{id}`
**Auth:** DOCTOR (must have at least one appointment with this patient)

**200 OK:** Patient object  
**403:** Doctor does not have an appointment with this patient  
**404:** Patient not found

---

## Appointments — `/api/appointments`

### `POST /api/appointments`
**Auth:** PATIENT

**Request:**
```json
{
  "doctorId": "6690...",
  "appointmentDate": "2026-08-18",
  "appointmentTime": "09:30",
  "reason": "Palpitations on exertion, three weeks"
}
```

**201 Created:**
```json
{
  "id": "6690...",
  "doctorId": "6690...",
  "patientId": "6690...",
  "doctorName": "Ananya Raghunathan",
  "patientName": "Nadia Fernandes",
  "specialization": "Cardiology",
  "appointmentDate": "2026-08-18",
  "appointmentTime": "09:30",
  "status": "PENDING",
  "reason": "Palpitations on exertion, three weeks",
  "room": "2.14",
  "createdAt": "2026-08-09"
}
```

**400:** Validation errors, or date is in the past, or slot is outside availability  
**404:** Doctor not found  
**409:** Slot already booked (race condition handled by partial unique index)

---

### `GET /api/appointments/my`
**Auth:** PATIENT or DOCTOR  
**Description:** Returns the authenticated user's appointments. If PATIENT, returns patient's appointments. If DOCTOR, returns doctor's appointments.

**200 OK:**
```json
[
  {
    "id": "6690...",
    "doctorId": "6690...",
    "patientId": "6690...",
    "doctorName": "Ananya Raghunathan",
    "patientName": "Nadia Fernandes",
    "specialization": "Cardiology",
    "appointmentDate": "2026-08-18",
    "appointmentTime": "09:30",
    "status": "CONFIRMED",
    "reason": "Palpitations on exertion, three weeks",
    "room": "2.14",
    "createdAt": "2026-08-09"
  }
]
```

---

### `GET /api/appointments/{id}`
**Auth:** PATIENT or DOCTOR (must own the appointment)

**200 OK:** Single appointment object  
**403:** Not the patient or doctor on this appointment  
**404:** Appointment not found

---

### `PUT /api/appointments/{id}/status`
**Auth:** DOCTOR (must own the appointment)

**Request:**
```json
{
  "status": "CONFIRMED"
}
```

Valid transitions:
- `PENDING` → `CONFIRMED`
- `PENDING` → `CANCELLED`
- `CONFIRMED` → `COMPLETED`
- `CONFIRMED` → `CANCELLED`

`COMPLETED` and `CANCELLED` are terminal. Cancelling through this route also sets
`active=false`, exactly as `DELETE /api/appointments/{id}` does, so the slot is
released for rebooking.

**Departure, recorded:** the PRD names the four states but not the actor moving
`PENDING` → `CONFIRMED`, and `PRODUCT.md` left "whether doctors can cancel as well
as patients" open. Decision — the doctor on the appointment confirms and may also
cancel a Pending or Confirmed appointment. The doctor schedule UI offers both.

**200 OK:** Updated appointment object  
**400:** Invalid status transition  
**403:** Not the doctor on this appointment  
**404:** Appointment not found

---

### `DELETE /api/appointments/{id}`
**Auth:** PATIENT (must own the appointment)  
**Description:** Cancels the appointment (soft-delete). Sets `status=CANCELLED`, `active=false`.

**204 No Content**

**403:** Not the patient on this appointment  
**404:** Appointment not found

---

## Medical Records — `/api/medical-records`

### `GET /api/medical-records/patient/{patientId}`
**Auth:** PATIENT (own records only) or DOCTOR (must have at least one appointment with this patient)

**200 OK:**
```json
[
  {
    "id": "6690...",
    "patientId": "6690...",
    "doctorId": "6690...",
    "doctorName": "Ananya Raghunathan",
    "specialization": "Cardiology",
    "date": "2026-02-11",
    "symptoms": "Annual review. Occasional palpitations at rest...",
    "diagnosis": "Benign ectopy. No structural abnormality on echo.",
    "prescription": ["Bisoprolol 1.25 mg — once daily, mornings, 90 days"],
    "notes": "ECG sinus rhythm, occasional ventricular ectopics...",
    "followUp": "Review in twelve months..."
  }
]
```

**403:** Unauthorized access (patient accessing another patient's records, or doctor without an appointment)

---

### `POST /api/medical-records`
**Auth:** DOCTOR (must have at least one appointment with the patient)

**Request:**
```json
{
  "patientId": "6690...",
  "appointmentId": "6690...",
  "symptoms": "Palpitations on exertion, three weeks",
  "diagnosis": "Benign premature ventricular complexes",
  "prescription": ["Bisoprolol 1.25 mg — once daily"],
  "notes": "ECG showed occasional PVCs...",
  "followUp": "Review in 3 months"
}
```

**201 Created:** Record object  
**403:** Doctor does not have an appointment with this patient

---

## Admin — `/api/admin`

### `POST /api/admin/doctors`
**Auth:** ADMIN

**Request:**
```json
{
  "email": "ananya.raghunathan@aldergate.clinic",
  "password": "Doctor@123",
  "name": "Ananya Raghunathan",
  "specialization": "Cardiology",
  "qualification": "MD, DM Cardiology",
  "experience": 14,
  "fee": 900.0,
  "room": "2.14",
  "about": "Sees adults for arrhythmia...",
  "languages": ["English", "Kannada", "Tamil"]
}
```

**201 Created:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "6690...",
    "email": "ananya.raghunathan@aldergate.clinic",
    "name": "Ananya Raghunathan",
    "role": "DOCTOR",
    "profileId": "6690..."
  }
}
```

**400:** Validation errors  
**409:** Email already registered

---

### `GET /api/admin/doctors`
**Auth:** ADMIN

**200 OK:** List of all doctor objects (same shape as `GET /api/doctors`)

---

## Seed Accounts (dev profile)

| Role    | Email                       | Password    |
|---------|-----------------------------|-------------|
| ADMIN   | admin@aldergate.clinic      | Admin@123   |
| DOCTOR  | ananya.raghunathan@aldergate.clinic | Doctor@123 |
| PATIENT | n.fernandes@example.com     | Patient@123 |

All 8 doctors follow the `firstname.lastname@aldergate.clinic` pattern with `Doctor@123`.

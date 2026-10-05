# Aldergate Clinic — Postman Kit

Import these 2 files (Postman > File > Import > drag both in):
1. `Aldergate-Clinic.postman_collection.json`
2. `Aldergate-Clinic-Local.postman_environment.json` (select it top-right)

Backend must run on `http://localhost:8080` first.


## Run order (top to bottom)
Each request auto-saves what the next one needs (tokens, doctorId, appointmentId, slotDate/slotTime):

1. `00 - Auth` — Register (unique email via `{{$timestamp}}`) or use seed logins:
   - Patient: `n.fernandes@example.com` / `Patient@123`
   - Doctor: `ananya.raghunathan@aldergate.clinic` / `Doctor@123`
   - Admin: `admin@aldergate.clinic` / `Admin@123`
2. `01 - Doctors` — List (saves `doctorId`), Slots (sets `slotDate` 14 days out + first free `slotTime`)
3. `02 - Patients` — profile read/update
4. `03 - Appointments` — Book (saves `appointmentId`) -> double-book 409 -> past-date 400 -> confirm as doctor -> invalid transition 400 -> patient cancel 204 LAST
5. `04 - Medical Records` — doctor creates (needs same doctor+patient appointment), patient/doctor read
6. `05 - Admin` — create doctor (unique email), list, patient-forbidden 403
7. `06 - Negative + Security` — no-token and role checks

## Gotchas
- Booking uses `{{slotDate}}`/`{{slotTime}}` — always run `01 > 05 Get Slots` first; never hardcode a past date.
- Doctor confirm/record calls need the SAME doctor that owns the appointment. If you get 403, log in as the owning doctor (booking saves its doctorId automatically).
- `09 Patient Cancels` ends the flow — re-run `01 Book` to test again.
- Collection variables (`patientToken`, `doctorToken`, `adminToken`, `doctorId`, `patientId`, `appointmentId`, `slotDate`, `slotTime`) update automatically; environment file just holds baseUrl + seed credentials.


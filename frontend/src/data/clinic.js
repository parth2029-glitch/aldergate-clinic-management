/* ------------------------------------------------------------------
   ILLUSTRATIVE CONTENT — every person, record and figure below is invented.
   No real practitioner, patient, credential or clinic is represented.

   Every application screen now reads from the Spring Boot API. This module
   survives only for the public marketing pages:
     - CLINIC / SPECIALTIES    static clinic facts and the department list
     - DOCTORS / MEDICAL_RECORDS   a sample roster and a sample record, used
                                   by Home and About to show the product

   APPOINTMENTS, PATIENT, DOCTOR_SELF, DOCTOR_DAY, DOCTOR_UPCOMING,
   PATIENT_ROSTER and ADMIN_ROSTER are no longer imported by anything and
   are pending removal.
   ------------------------------------------------------------------ */

export const CLINIC = {
  name: "Aldergate Clinic",
  line1: "44 Aldergate Row",
  line2: "Bengaluru 560042",
  phone: "+91 80 4127 6630",
  hours: "Mon–Sat, 08:30 – 19:00",
};

export const SPECIALTIES = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "General Medicine",
  "Neurology",
  "Orthopaedics",
  "Paediatrics",
  "Pulmonology",
];

export const DOCTORS = [
  {
    id: "d-1",
    name: "Ananya Raghunathan",
    specialization: "Cardiology",
    experience: 14,
    qualification: "MD, DM Cardiology",
    room: "2.14",
    fee: 900,
    about:
      "Sees adults for arrhythmia, hypertension and post-infarct follow-up. Runs the Tuesday and Thursday echo list.",
    languages: ["English", "Kannada", "Tamil"],
    days: ["Mon", "Tue", "Thu", "Fri"],
    slots: ["09:00", "09:30", "10:00", "11:30", "12:00", "16:00", "16:30"],
    booked: ["10:00", "16:00"],
  },
  {
    id: "d-2",
    name: "Marcus Oyelaran",
    specialization: "Orthopaedics",
    experience: 11,
    qualification: "MS Orthopaedics",
    room: "1.07",
    fee: 850,
    about:
      "Knee and shoulder work, sports injury rehab, and fracture follow-up. Operating list runs Wednesdays.",
    languages: ["English", "Yoruba"],
    days: ["Mon", "Tue", "Thu", "Sat"],
    slots: ["08:30", "09:00", "10:30", "11:00", "15:00", "15:30", "17:00"],
    booked: ["09:00"],
  },
  {
    id: "d-3",
    name: "Priyamvada Sethi",
    specialization: "Dermatology",
    experience: 8,
    qualification: "MD Dermatology",
    room: "3.02",
    fee: 700,
    about:
      "Chronic eczema, acne and pigmentation. Patch testing by prior appointment only.",
    languages: ["English", "Hindi", "Punjabi"],
    days: ["Tue", "Wed", "Fri"],
    slots: ["10:00", "10:30", "11:00", "14:30", "15:00", "15:30"],
    booked: ["10:30", "15:00", "15:30"],
  },
  {
    id: "d-4",
    name: "Tobias Lindqvist",
    specialization: "Neurology",
    experience: 19,
    qualification: "MD, PhD Neurology",
    room: "3.21",
    fee: 1200,
    about:
      "Headache disorders, epilepsy and movement disorders. Longer first consultations by design.",
    languages: ["English", "Swedish"],
    days: ["Mon", "Wed", "Fri"],
    slots: ["09:30", "10:30", "11:30", "14:00", "15:00"],
    booked: ["11:30"],
  },
  {
    id: "d-5",
    name: "Rehana Qureshi",
    specialization: "Paediatrics",
    experience: 12,
    qualification: "MD Paediatrics",
    room: "0.11",
    fee: 650,
    about:
      "Newborn to sixteen. Growth monitoring, immunisation schedules and childhood asthma.",
    languages: ["English", "Hindi", "Urdu"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    slots: ["08:30", "09:00", "09:30", "10:00", "16:30", "17:00", "17:30"],
    booked: ["09:30", "17:00"],
  },
  {
    id: "d-6",
    name: "Ezekiel Boateng",
    specialization: "General Medicine",
    experience: 6,
    qualification: "MBBS, MD General Medicine",
    room: "1.22",
    fee: 500,
    about:
      "First point of contact for undifferentiated illness, and onward referral within the clinic.",
    languages: ["English", "Twi"],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    slots: ["08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30"],
    booked: ["09:00", "14:00"],
  },
  {
    id: "d-7",
    name: "Ingrid Solberg",
    specialization: "Endocrinology",
    experience: 16,
    qualification: "MD, DM Endocrinology",
    room: "2.30",
    fee: 950,
    about:
      "Type 1 and type 2 diabetes, thyroid disease and metabolic bone conditions.",
    languages: ["English", "Norwegian"],
    days: ["Tue", "Thu"],
    slots: ["11:00", "11:30", "12:00", "15:30", "16:00"],
    booked: ["11:00", "11:30", "12:00", "15:30", "16:00"],
  },
  {
    id: "d-8",
    name: "Vikram Balasubramanian",
    specialization: "Pulmonology",
    experience: 9,
    qualification: "MD Pulmonary Medicine",
    room: "2.05",
    fee: 800,
    about:
      "Asthma, COPD and sleep-disordered breathing. Spirometry on site.",
    languages: ["English", "Tamil", "Telugu"],
    days: ["Wed", "Thu", "Fri", "Sat"],
    slots: ["09:00", "09:30", "13:30", "14:00", "14:30", "16:00"],
    booked: ["13:30"],
  },
];

/* The core feature: consultation history, newest first. */
export const MEDICAL_RECORDS = {
  "p-1": [
    {
      id: "r-1",
      date: "2026-02-11",
      doctor: "Ananya Raghunathan",
      specialization: "Cardiology",
      symptoms:
        "Annual review. Occasional palpitations at rest, no syncope. Father had a myocardial infarction at 58.",
      diagnosis: "Benign ectopy. No structural abnormality on echo.",
      prescription: [
        "Bisoprolol 1.25 mg — once daily, mornings, 90 days",
      ],
      notes:
        "ECG sinus rhythm, occasional ventricular ectopics. Echo unremarkable, ejection fraction 62 percent. Reassured. Advised to log episodes with time of day and caffeine intake.",
      followUp: "Review in twelve months, sooner if episodes become sustained or she feels faint.",
    },
    {
      id: "r-2",
      date: "2026-06-02",
      doctor: "Ezekiel Boateng",
      specialization: "General Medicine",
      symptoms: "Dry cough persisting five weeks after a febrile illness. No breathlessness, no weight loss.",
      diagnosis: "Post-viral cough.",
      prescription: [
        "No antibiotic indicated",
        "Simple linctus as required",
      ],
      notes:
        "Chest clear on auscultation. Oxygen saturation 98 percent on air. Explained expected timeline of six to eight weeks. Safety-netted for haemoptysis or fever.",
      followUp: "Return if the cough persists beyond eight weeks or any blood is coughed up.",
    },
    {
      id: "r-3",
      date: "2025-09-08",
      doctor: "Ananya Raghunathan",
      specialization: "Cardiology",
      symptoms: "Referred after an incidental murmur was heard at a pre-employment medical.",
      diagnosis: "Innocent flow murmur.",
      prescription: ["None"],
      notes:
        "Soft mid-systolic murmur at the left sternal edge, no radiation. Echo showed structurally normal valves. No endocarditis prophylaxis required.",
      followUp: "No routine follow-up needed. Discharged back to general practice.",
    },
  ],
  "p-2": [
    {
      id: "r-4",
      date: "2026-02-14",
      doctor: "Ananya Raghunathan",
      specialization: "Cardiology",
      symptoms: "Six-week review following angioplasty and stent to the right coronary artery.",
      diagnosis: "Stable ischaemic heart disease, post-PCI.",
      prescription: [
        "Aspirin 75 mg — once daily, indefinitely",
        "Ticagrelor 90 mg — twice daily, 12 months",
        "Atorvastatin 80 mg — once nightly",
      ],
      notes:
        "Walking thirty minutes daily without chest pain. Blood pressure 128 over 76. Cardiac rehabilitation attendance good.",
      followUp: "Repeat lipid panel before the next visit. Review in six months.",
    },
  ],
};

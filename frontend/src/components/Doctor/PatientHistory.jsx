import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CaretDown, NotePencil, FileDashed } from "@phosphor-icons/react";
import { medicalRecordService } from "../../services/medicalRecordService";
import { patientService } from "../../services/patientService";
import { appointmentService } from "../../services/appointmentService";
import { fmtDate } from "../../lib/format";
import { Monogram, EmptyState, Facts, StatusTag } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Doctor.module.css";

export default function PatientHistory() {
  const { id } = useParams();
  
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const [pt, recs, apps] = await Promise.all([
          patientService.getPatientById(id),
          medicalRecordService.getPatientRecords(id),
          appointmentService.getMyAppointments()
        ]);
        setPatient(pt);
        const sortedRecs = [...(recs || [])].sort((a, b) => b.date.localeCompare(a.date));
        setRecords(sortedRecs);
        if (sortedRecs.length) {
          setOpen(new Set([sortedRecs[0].id]));
        }
        setAppointment(apps.find((a) => a.patientId === id) || null);
      } catch (err) {
        setError(err.message || "Failed to load patient history");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const toggle = (rid) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(rid)) next.delete(rid);
      else next.add(rid);
      return next;
    });

  if (loading) return <div className="shell page"><LoadingSpinner label="Loading history..." /></div>;
  if (error) return <div className="shell page"><p className="error">{error}</p></div>;

  if (!patient) {
    return (
      <div className="shell page">
        <h1>No such patient</h1>
        <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
          You can only open patients you have an appointment with.
        </p>
        <Link to="/doctor/patients" className="btn btn--primary" style={{ marginTop: "var(--sp-5)" }}>
          Back to my patients
        </Link>
      </div>
    );
  }

  return (
    <div className="shell page">
      <Link to="/doctor/patients" className={common.back}>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" />
        My patients
      </Link>

      <div className={common.split}>
        <div>
          <div className={styles.historyHead}>
            <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "flex-start" }}>
              <Monogram name={patient.name} size={52} tone={0} />
              <div>
                <h1 className={styles.historyName}>{patient.name}</h1>
                <div className={styles.historyMeta}>
                  <span>
                    <span className="num">{patient.age}</span> · {patient.gender}
                  </span>
                  <span>Blood group {patient.bloodGroup || "-"}</span>
                  <span>
                    Registered {patient.registeredAt ? fmtDate(patient.registeredAt) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <Link to={`/doctor/patients/${id}/consultation`} className="btn btn--primary">
              <NotePencil size={17} weight="bold" />
              Add consultation
            </Link>
          </div>

          <h2 style={{ marginTop: "var(--sp-7)", fontSize: "var(--fs-h2)" }}>
            Consultation history
          </h2>
          {records.length > 0 && (
            <p className="muted" style={{ marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>
              Newest first. The most recent visit is open.
            </p>
          )}

          <div style={{ marginTop: "var(--sp-4)" }}>
            {records.length === 0 ? (
              <div className="panel">
                <EmptyState
                  icon={FileDashed}
                  title="No previous consultations"
                  body={`This is the first time ${patient.name.split(" ")[0]} is being seen here. Whatever you write today becomes the start of the record.`}
                  action={
                    <Link
                      to={`/doctor/patients/${id}/consultation`}
                      className="btn btn--primary btn--sm"
                    >
                      Write the first entry
                    </Link>
                  }
                />
              </div>
            ) : (
              records.map((r) => {
                const isOpen = open.has(r.id);
                return (
                  <article className={styles.entry} key={r.id}>
                    <button
                      className={styles.entryButton}
                      onClick={() => toggle(r.id)}
                      aria-expanded={isOpen}
                      aria-controls={`rec-${r.id}`}
                    >
                      <span className={styles.entryDate}>{fmtDate(r.date)}</span>
                      <span style={{ minWidth: 0 }}>
                        <span className={styles.entryDiagnosis}>{r.diagnosis}</span>
                        <span className={styles.entryDoctor}>
                          Dr {r.doctorName} · {r.specialization}
                        </span>
                      </span>
                      <CaretDown
                        size={16}
                        className={`${styles.entryCaret} ${isOpen ? styles.entryCaretOpen : ""}`}
                        aria-hidden="true"
                      />
                    </button>

                    {isOpen && (
                      <div className={styles.entryBody} id={`rec-${r.id}`}>
                        <Detail label="Symptoms" text={r.symptoms} />
                        <div className={styles.entryField}>
                          <span className={styles.entryLabel}>Prescription</span>
                          <ul className={styles.rxList}>
                            {r.prescription.map((p) => (
                              <li className={styles.rxItem} key={p}>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Detail label="Notes" text={r.notes} />
                        <div className={styles.entryField}>
                          <span className={styles.entryLabel}>Follow-up</span>
                          <p className={styles.followUp}>{r.followUp}</p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>

        <aside className={common.asideSticky}>
          {appointment && (
            <div className="panel">
              <div className="panel__head">
                <h2 style={{ fontSize: "var(--fs-h3)" }}>This appointment</h2>
                <StatusTag status={appointment.status} />
              </div>
              <div className="panel__body">
                <Facts
                  items={[
                    { label: "Date", value: fmtDate(appointment.date) },
                    { label: "Time", value: appointment.time, mono: true },
                    { label: "Reason given", value: appointment.reason },
                  ]}
                />
              </div>
            </div>
          )}

          <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
            <div className="panel__head">
              <h2 style={{ fontSize: "var(--fs-h3)" }}>Patient record</h2>
            </div>
            <div className="panel__body">
              <Facts
                items={[
                  { label: "Age", value: patient.age, mono: true },
                  { label: "Gender", value: patient.gender },
                  { label: "Blood group", value: patient.bloodGroup || "-" },
                  {
                    label: "Registered",
                    value: patient.registeredAt ? fmtDate(patient.registeredAt) : "—",
                  },
                  { label: "Records on file", value: records.length, mono: true },
                ]}
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, text }) {
  return (
    <div className={styles.entryField}>
      <span className={styles.entryLabel}>{label}</span>
      <p className={styles.entryText}>{text}</p>
    </div>
  );
}

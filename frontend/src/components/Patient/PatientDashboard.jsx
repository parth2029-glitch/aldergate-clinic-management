import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarPlus, CalendarBlank, CaretRight } from "@phosphor-icons/react";
import { appointmentService } from "../../services/appointmentService";
import { patientService } from "../../services/patientService";
import { medicalRecordService } from "../../services/medicalRecordService";
import { doctorService } from "../../services/doctorService";
import { fmtDate, fmtDayDate, isPast } from "../../lib/format";
import { PageHead, StatusTag, EmptyState, Monogram } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Patient.module.css";

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [apps, pt, docs] = await Promise.all([
          appointmentService.getMyAppointments(),
          patientService.getPatientByUserId(),
          doctorService.getAllDoctors(),
        ]);
        if (!alive) return;
        setAppointments(apps);
        setPatient(pt);
        setDoctors(docs);
        const recs = await medicalRecordService.getPatientRecords(pt.id);
        if (alive) setRecords(recs || []);
      } catch (err) {
        if (alive) setError(err.message || "Failed to load your dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="shell page">
        <LoadingSpinner label="Loading your dashboard..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="shell page">
        <p className="error">{error}</p>
      </div>
    );
  }

  const upcoming = appointments
    .filter((a) => !isPast(a.date) && a.status !== "Cancelled")
    .sort((a, b) => a.date.localeCompare(b.date));

  const next = upcoming[0];
  const later = upcoming.slice(1);
  const past = appointments.filter((a) => isPast(a.date)).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <div className="shell page">
      <PageHead
        title={`Good to see you, ${patient?.name?.split(" ")[0] ?? "there"}`}
        lede="Your next appointment, and everything written down so far."
        actions={
          <Link to="/doctors" className="btn btn--primary">
            <CalendarPlus size={17} weight="bold" />
            Book an appointment
          </Link>
        }
      />

      <div className={common.split}>
        <div>
          {next ? (
            <div className={styles.nextCard}>
              <span className={styles.nextLabel}>Next appointment</span>
              <div className={styles.nextWhen}>
                {fmtDayDate(next.date)} · {next.time}
              </div>
              <div className={styles.nextWho}>Dr {next.doctorName}</div>
              <div className={styles.nextWhere}>
                {next.specialization} · Room {next.room} · {next.status}
              </div>
              <div className={styles.nextActions}>
                <Link to={`/patient/appointments/${next.id}`} className={styles.nextBtn}>
                  View details
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="panel">
              <EmptyState
                icon={CalendarBlank}
                title="Nothing booked"
                body="When you book, the next appointment shows here with the room number and the doctor you are seeing."
                action={
                  <Link to="/doctors" className="btn btn--primary btn--sm">
                    Find a doctor
                  </Link>
                }
              />
            </div>
          )}

          {later.length > 0 && (
            <section style={{ marginTop: "var(--sp-6)" }}>
              <SectionHead title="Also coming up" to="/patient/appointments" />
              <div className="panel">
                <ul className="rows">
                  {later.map((a) => (
                    <li key={a.id}>
                      <Link to={`/patient/appointments/${a.id}`} className={styles.apptRow}>
                        <span className={styles.apptWhen}>
                          <span className={styles.apptDate}>{fmtDayDate(a.date)}</span>
                          <span className={styles.apptTime}>{a.time}</span>
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span className={styles.apptWho}>Dr {a.doctorName}</span>
                          <span className={styles.apptReason}>{a.reason}</span>
                        </span>
                        <StatusTag status={a.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section style={{ marginTop: "var(--sp-7)" }}>
            <SectionHead title="Your consultation history" />
            {records.length === 0 ? (
              <div className="panel">
                <EmptyState
                  title="Nothing written down yet"
                  body="After your first consultation here, what the doctor found and prescribed appears in this list."
                />
              </div>
            ) : (
              <div className="panel">
                <ul className="rows">
                  {[...records]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((r) => (
                      <li key={r.id}>
                        <div style={{ padding: "var(--sp-4) var(--sp-5)" }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "var(--sp-4)",
                              flexWrap: "wrap",
                            }}
                          >
                            <strong style={{ letterSpacing: "-0.012em" }}>
                              {r.diagnosis}
                            </strong>
                            <span className="num" style={{ color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>
                              {fmtDate(r.date)}
                            </span>
                          </div>
                          <p
                            style={{
                              marginTop: 4,
                              fontSize: "var(--fs-sm)",
                              color: "var(--ink-3)",
                            }}
                          >
                            Dr {r.doctorName} · {r.specialization}
                          </p>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className={common.asideSticky}>
          <div className="panel">
            <div className="panel__head">
              <h2 style={{ fontSize: "var(--fs-h3) " }}>At a glance</h2>
            </div>
            <div className="panel__body" style={{ paddingBlock: "var(--sp-3)" }}>
              <Stat label="Upcoming" value={upcoming.length} />
              <Stat label="Past visits" value={past.length} />
              <Stat label="Records on file" value={records.length} />
              <Stat
                label="Registered since"
                value={patient?.registeredAt ? fmtDate(patient.registeredAt) : "—"}
              />
            </div>
          </div>

          <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
            <div className="panel__head">
              <h2 style={{ fontSize: "var(--fs-h3)" }}>Seen recently</h2>
            </div>
            <ul className="rows">
              {doctors.slice(0, 3).map((d, i) => (
                <li key={d.id}>
                  <Link
                    to={`/doctors/${d.id}`}
                    className="row-link"
                    style={{ display: "flex", alignItems: "center", gap: "var(--sp-3)" }}
                  >
                    <Monogram name={d.name} size={32} tone={i} />
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontWeight: 500, fontSize: "var(--fs-sm)" }}>
                        Dr {d.name}
                      </span>
                      <span style={{ display: "block", fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>
                        {d.specialization}
                      </span>
                    </span>
                    <CaretRight size={15} color="var(--ink-3)" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHead({ title, to }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "var(--sp-4)",
        marginBottom: "var(--sp-3)",
      }}
    >
      <h2 style={{ fontSize: "var(--fs-h3)" }}>{title}</h2>
      {to && (
        <Link to={to} className="link-more">
          See all
        </Link>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "var(--sp-4)",
        padding: "10px 0",
        borderTop: "1px solid var(--line)",
        fontSize: "var(--fs-sm)",
      }}
    >
      <span style={{ color: "var(--ink-3)" }}>{label}</span>
      <span className="num" style={{ fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}

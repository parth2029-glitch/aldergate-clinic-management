import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CaretRight, CalendarBlank } from "@phosphor-icons/react";
import { appointmentService } from "../../services/appointmentService";
import { doctorService } from "../../services/doctorService";
import { useSession } from "../../state/session";
import { fmtDate, fmtDayDate } from "../../lib/format";
import { PageHead, StatusTag, EmptyState, Monogram } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Doctor.module.css";

export default function DoctorDashboard() {
  const { user } = useSession();
  const [appointments, setAppointments] = useState([]);
  const [patientsCount, setPatientsCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [apps, patients, me] = await Promise.all([
          appointmentService.getMyAppointments(),
          doctorService.getDoctorPatients(),
          // The session user carries only id/email/name/role/profileId — the room
          // and department come from the doctor's own profile record.
          user?.profileId ? doctorService.getDoctorById(user.profileId) : Promise.resolve(null),
        ]);
        setAppointments(apps);
        setPatientsCount(patients.length);
        setProfile(me);
      } catch (err) {
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.profileId]);

  if (loading) return <div className="shell page"><LoadingSpinner label="Loading dashboard..." /></div>;
  if (error) return <div className="shell page"><p className="error">{error}</p></div>;

  const todayDate = new Date().toISOString().split('T')[0];
  const today = appointments.filter((a) => a.date === todayDate);
  const upcoming = appointments.filter((a) => a.date > todayDate);

  const live = today.filter((a) => a.status !== "Cancelled");
  const patientsToday = new Set(live.map((a) => a.patientId)).size;

  return (
    <div className="shell page">
      <PageHead
        title={`Today, ${fmtDate(todayDate)}`}
        lede={`Room ${profile?.room || "-"} · ${profile?.specialization || "-"}`}
      />

      <div className={styles.counters}>
        <Counter value={live.length} label="Appointments today" />
        <Counter value={patientsToday} label="Patients today" />
        <Counter value={upcoming.length} label="Booked ahead" />
        <Counter value={patientsCount} label="Patients on file" />
      </div>

      <div className={common.split}>
        <div>
          <h2 style={{ fontSize: "var(--fs-h2)", marginBottom: "var(--sp-3)" }}>
            Today&rsquo;s list
          </h2>

          <div className="panel">
            {today.length === 0 ? (
              <EmptyState
                icon={CalendarBlank}
                title="Nothing booked today"
                body="Appointments patients book will appear here in time order."
              />
            ) : (
              <ul className="rows">
                {today.map((a, i) => (
                  <li key={a.id} className="settle" style={{ "--i": i }}>
                    <Link
                      to={`/doctor/patients/${a.patientId}`}
                      className={`${styles.slotRow} ${
                        a.status === "Cancelled" ? styles.slotCancelled : ""
                      }`}
                    >
                      <span className={styles.slotTime}>{a.time}</span>
                      <Monogram name={a.patientName} size={36} tone={i} />
                      <span style={{ minWidth: 0 }}>
                        <span className={styles.patientName}>
                          {a.patientName}
                          {a.age != null && <span className={styles.patientAge}>{a.age}</span>}
                        </span>
                        <span className={styles.slotReason}>{a.reason}</span>
                      </span>
                      <span className={styles.slotTrail}>
                        {a.lastSeen && (
                          <span className={styles.lastSeen}>
                            Last seen
                            <br />
                            <span className="num">{fmtDate(a.lastSeen)}</span>
                          </span>
                        )}
                        <StatusTag status={a.status} />
                        <CaretRight size={16} color="var(--ink-3)" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className={common.asideSticky}>
          <div className="panel">
            <div className="panel__head">
              <h2 style={{ fontSize: "var(--fs-h3)" }}>Coming up</h2>
              <Link to="/doctor/appointments" className="link-more">
                Full schedule
              </Link>
            </div>
            <ul className="rows">
              {upcoming.map((a) => (
                <li key={a.id}>
                  <Link to={`/doctor/patients/${a.patientId}`} className="row-link">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "var(--sp-3)",
                        alignItems: "baseline",
                      }}
                    >
                      <span style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>
                        {a.patientName}
                      </span>
                      <span className="num" style={{ fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>
                        {a.time}
                      </span>
                    </div>
                    <div style={{ marginTop: 2, fontSize: "var(--fs-xs)", color: "var(--ink-3)" }}>
                      {fmtDayDate(a.date)} · {a.reason}
                    </div>
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

function Counter({ value, label }) {
  return (
    <div className={styles.counter}>
      <div className={styles.counterValue}>{value}</div>
      <div className={styles.counterLabel}>{label}</div>
    </div>
  );
}

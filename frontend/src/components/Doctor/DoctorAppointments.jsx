import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CaretRight, CalendarBlank } from "@phosphor-icons/react";
import { appointmentService } from "../../services/appointmentService";
import { fmtDate, fmtDayDate } from "../../lib/format";
import { PageHead, StatusTag, EmptyState, Monogram } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import styles from "./Doctor.module.css";
import patientStyles from "../Patient/Patient.module.css";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "Confirmed", label: "Confirmed" },
  { id: "Pending", label: "Pending" },
  { id: "Cancelled", label: "Cancelled" },
];

export default function DoctorAppointments() {
  const [filter, setFilter] = useState("all");
  const [ALL, setALL] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const apps = await appointmentService.getMyAppointments();
        setALL(apps);
      } catch (err) {
        setError(err.message || "Failed to load schedule");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleStatusChange(e, id, status) {
    e.preventDefault();
    try {
      await appointmentService.updateStatus(id, status);
      setALL((prev) => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      alert(err.message || "Failed to update status");
    }
  }

  if (loading) return <div className="shell page"><LoadingSpinner label="Loading schedule..." /></div>;
  if (error) return <div className="shell page"><p className="error">{error}</p></div>;

  const rows = ALL.filter((a) => filter === "all" || a.status === filter);

  const byDay = rows.reduce((acc, a) => {
    (acc[a.date] ??= []).push(a);
    return acc;
  }, {});

  const days = Object.keys(byDay).sort();

  const counts = FILTERS.reduce((acc, f) => {
    acc[f.id] = f.id === "all" ? ALL.length : ALL.filter((a) => a.status === f.id).length;
    return acc;
  }, {});

  return (
    <div className="shell page">
      <PageHead
        title="Schedule"
        lede="Every appointment booked with you, grouped by day."
      />

      <div className={patientStyles.tabs} role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            role="tab"
            aria-selected={filter === f.id}
            className={`${patientStyles.tab} ${filter === f.id ? patientStyles.tabOn : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
            <span className={patientStyles.tabCount}>{counts[f.id]}</span>
          </button>
        ))}
      </div>

      {days.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={CalendarBlank}
            title={`Nothing ${filter === "all" ? "booked" : filter.toLowerCase()}`}
            body="Change the filter above to see the rest of your schedule."
            action={
              <button className="btn btn--secondary btn--sm" onClick={() => setFilter("all")}>
                Show everything
              </button>
            }
          />
        </div>
      ) : (
        <div className="panel" style={{ overflow: "hidden" }}>
          {days.map((day) => (
            <section key={day}>
              <div className={styles.dayHead}>
                <span className={styles.dayHeadDate}>{fmtDayDate(day)}</span>
                <span className={styles.dayHeadCount}>
                  <span className="num">{byDay[day].length}</span>{" "}
                  {byDay[day].length === 1 ? "appointment" : "appointments"}
                </span>
              </div>

              <ul className="rows">
                {byDay[day]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((a, i) => (
                    <li key={a.id}>
                      <Link
                        to={`/doctor/patients/${a.patientId}`}
                        className={`${styles.slotRow} ${
                          a.status === "Cancelled" ? styles.slotCancelled : ""
                        }`}
                      >
                        <span className={styles.slotTime}>{a.time}</span>
                        <Monogram name={a.patientName} size={36} tone={i + 2} />
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
                          <div style={{ display: "flex", gap: "var(--sp-2)", alignItems: "center" }} onClick={(e) => e.preventDefault()}>
                            {a.status === "Pending" && (
                              <>
                                <button className="btn btn--secondary btn--sm" onClick={(e) => handleStatusChange(e, a.id, "Confirmed")}>Confirm</button>
                                <button className="btn btn--ghost btn--sm" onClick={(e) => handleStatusChange(e, a.id, "Cancelled")}>Cancel</button>
                              </>
                            )}
                            {a.status === "Confirmed" && (
                              <button className="btn btn--ghost btn--sm" onClick={(e) => handleStatusChange(e, a.id, "Cancelled")}>Cancel</button>
                            )}
                          </div>
                          <StatusTag status={a.status} />
                          <CaretRight size={16} color="var(--ink-3)" aria-hidden="true" />
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

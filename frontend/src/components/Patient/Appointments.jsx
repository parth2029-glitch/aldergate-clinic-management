import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarBlank, CalendarPlus } from "@phosphor-icons/react";
import { appointmentService } from "../../services/appointmentService";
import { fmtDayDate, isPast } from "../../lib/format";
import { PageHead, StatusTag, EmptyState } from "../ui/Bits";
import styles from "./Patient.module.css";

const TABS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "past", label: "Past" },
  { id: "cancelled", label: "Cancelled" },
];

const bucket = (a) => {
  if (a.status === "Cancelled") return "cancelled";
  return isPast(a.date) ? "past" : "upcoming";
};

export default function Appointments() {
  const [tab, setTab] = useState("upcoming");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getMyAppointments()
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const counts = TABS.reduce((acc, t) => {
    acc[t.id] = appointments.filter((a) => bucket(a) === t.id).length;
    return acc;
  }, {});

  const rows = appointments.filter((a) => bucket(a) === tab).sort((a, b) =>
    tab === "upcoming" ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date),
  );

  return (
    <div className="shell page">
      <PageHead
        title="My appointments"
        lede="Everything booked, attended, and cancelled."
        actions={
          <Link to="/doctors" className="btn btn--primary">
            <CalendarPlus size={17} weight="bold" />
            Book an appointment
          </Link>
        }
      />

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabOn : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className={styles.tabCount}>{counts[t.id]}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: "var(--sp-4)" }}>Loading appointments...</div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CalendarBlank}
            title={
              tab === "upcoming"
                ? "Nothing booked"
                : tab === "past"
                  ? "No past appointments"
                  : "Nothing cancelled"
            }
            body={
              tab === "upcoming"
                ? "Book with any doctor and it will appear here straight away."
                : tab === "past"
                  ? "Appointments move here once the date has passed."
                  : "Appointments you cancel stay here rather than disappearing, so the history stays complete."
            }
            action={
              tab === "upcoming" ? (
                <Link to="/doctors" className="btn btn--primary btn--sm">
                  Find a doctor
                </Link>
              ) : null
            }
          />
        ) : (
          <ul className="rows">
            {rows.map((a, i) => (
              <li key={a.id} className="settle" style={{ "--i": i }}>
                <Link to={`/patient/appointments/${a.id}`} className={styles.apptRow}>
                  <span className={styles.apptWhen}>
                    <span className={styles.apptDate}>{fmtDayDate(a.date)}</span>
                    <span className={styles.apptTime}>{a.time}</span>
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span className={styles.apptWho}>Dr {a.doctorName}</span>
                    <span className={styles.apptReason}>
                      {a.specialization} · {a.reason}
                    </span>
                  </span>
                  <StatusTag status={a.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

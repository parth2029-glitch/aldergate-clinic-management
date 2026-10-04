import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Translate } from "@phosphor-icons/react";
import { doctorService } from "../../services/doctorService";
import { Monogram, Facts, Notice } from "../ui/Bits";
import { RowsSkeleton } from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Patient.module.css";

const WEEK_ORDER = [
  { key: "MONDAY", label: "Monday" },
  { key: "TUESDAY", label: "Tuesday" },
  { key: "WEDNESDAY", label: "Wednesday" },
  { key: "THURSDAY", label: "Thursday" },
  { key: "FRIDAY", label: "Friday" },
  { key: "SATURDAY", label: "Saturday" },
  { key: "SUNDAY", label: "Sunday" },
];

export default function DoctorDetails() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    doctorService.getDoctorById(id)
      .then(setDoctor)
      .catch(err => setError(err.message || "Failed to load doctor."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="shell page"><RowsSkeleton count={5} /></div>;
  if (error || !doctor) {
    return (
      <div className="shell page">
        <h1>That doctor is not listed</h1>
        <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
          They may no longer practise here.
        </p>
        <Link to="/doctors" className="btn btn--primary" style={{ marginTop: "var(--sp-5)" }}>
          Back to all doctors
        </Link>
      </div>
    );
  }

  // The API publishes a recurring weekly template, not dated slots. Show the
  // template here; the actual dated times come from /slots on the booking screen.
  const weekly = doctor.availability?.weekly || {};
  const dayRows = WEEK_ORDER.filter((d) => (weekly[d.key] || []).length > 0).map((d) => ({
    label: d.label,
    ranges: weekly[d.key],
  }));
  const consulting = dayRows.length > 0;

  return (
    <div className="shell page">
      <Link to="/doctors" className={common.back}>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" />
        All doctors
      </Link>

      <div className={`${common.split} ${common.splitWide}`}>
        <div>
          <div className={styles.detailHead}>
            <Monogram name={doctor.name} size={58} tone={0} />
            <div>
              <h1 className={styles.detailName}>Dr {doctor.name}</h1>
              <p className={styles.detailSpec}>{doctor.specialization}</p>
            </div>
          </div>

          <p className={styles.about}>{doctor.about}</p>

          <h2 className={styles.sectionTitle}>Consulting hours</h2>
          <p className="muted" style={{ marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>
            {consulting
              ? `Recurring weekly hours for Dr ${doctor.name.split(" ").pop()}. Real times for a given day are shown when you book.`
              : "No consulting hours have been published yet."}
          </p>

          {consulting ? (
            <div className="panel" style={{ marginTop: "var(--sp-3)" }}>
              <ul className="rows">
                {dayRows.map((d) => (
                  <li
                    key={d.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "var(--sp-4)",
                      padding: "10px var(--sp-5)",
                    }}
                  >
                    <span style={{ fontWeight: 500 }}>{d.label}</span>
                    <span className="num" style={{ color: "var(--ink-2)" }}>
                      {d.ranges.map((r) => `${r.start}–${r.end}`).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ marginTop: "var(--sp-4)" }}>
              <Notice tone="warn">
                Try another doctor in {doctor.specialization}.
              </Notice>
            </div>
          )}

          <h2 className={styles.sectionTitle}>Practice details</h2>
          <div style={{ marginTop: "var(--sp-3)", maxWidth: "56ch" }}>
            <Facts
              items={[
                { label: "Qualification", value: doctor.qualification },
                { label: "Experience", value: `${doctor.experience} years`, mono: true },
                { label: "Consulting room", value: doctor.room, mono: true },
                { label: "Consultation fee", value: `₹${doctor.fee}`, mono: true },
                { label: "Languages", value: doctor.languages.join(", ") },
              ]}
            />
          </div>
        </div>

        <aside className={common.asideSticky}>
          <div className="panel">
            <div className="panel__body">
              <span className="section-label">
                Book with Dr {doctor.name.split(" ").pop()}
              </span>
              <p
                style={{
                  marginTop: "var(--sp-3)",
                  fontSize: "var(--fs-sm)",
                  color: "var(--ink-2)",
                  lineHeight: 1.6,
                }}
              >
                {consulting
                  ? "Choose a date and the times open that day will appear."
                  : "This doctor has no published availability right now."}
              </p>

              {consulting ? (
                <Link
                  to={`/patient/book/${doctor.id}`}
                  className="btn btn--primary btn--block"
                  style={{ marginTop: "var(--sp-4)" }}
                >
                  <CalendarPlus size={17} weight="bold" />
                  Choose a time
                </Link>
              ) : (
                <Link
                  to="/doctors"
                  className="btn btn--secondary btn--block"
                  style={{ marginTop: "var(--sp-4)" }}
                >
                  See other {doctor.specialization} doctors
                </Link>
              )}

              <p
                style={{
                  marginTop: "var(--sp-4)",
                  paddingTop: "var(--sp-4)",
                  borderTop: "1px solid var(--line)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--ink-3)",
                  display: "flex",
                  gap: 8,
                  lineHeight: 1.6,
                }}
              >
                <Translate size={15} aria-hidden="true" style={{ flex: "none", marginTop: 1 }} />
                Consultations in {doctor.languages.join(", ")}.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, UserPlus } from "@phosphor-icons/react";
import { SPECIALTIES } from "../../data/clinic";
import { adminService } from "../../services/adminService";
import { PageHead, Monogram, EmptyState, Notice } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Admin.module.css";

export default function DoctorRoster() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    adminService
      .getAllDoctorsAdmin()
      .then((list) => {
        if (alive) setDoctors(list);
      })
      .catch((err) => alive && setError(err.message || "Could not load doctors."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="shell page">
      <PageHead
        title="Doctors"
        lede="Doctor accounts are created here and nowhere else. Patients register themselves."
        actions={
          <Link to="/admin/doctors/new" className="btn btn--primary">
            <Plus size={17} weight="bold" />
            Add a doctor
          </Link>
        }
      />

      <div style={{ marginBottom: "var(--sp-6)", maxWidth: "72ch" }}>
        <Notice tone="info">
          Nobody can register as a doctor. That is deliberate — a self-service doctor
          sign-up would let anyone create an account and read patient records.
        </Notice>
      </div>

      <div className="panel">
        {loading ? (
          <div style={{ padding: "var(--sp-5)" }}>
            <LoadingSpinner label="Loading doctors..." />
          </div>
        ) : error ? (
          <EmptyState icon={UserPlus} title="Could not load doctors" body={error} />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No doctors yet"
            body="Add the first doctor and they will appear to patients straight away."
            action={
              <Link to="/admin/doctors/new" className="btn btn--primary btn--sm">
                Add a doctor
              </Link>
            }
          />
        ) : (
          <ul className="rows">
            {doctors.map((d, i) => (
              <li key={d.id} className="settle" style={{ "--i": i }}>
                <div className={common.personRow} style={{ padding: "var(--sp-4) var(--sp-5)" }}>
                  <Monogram name={d.name} size={40} tone={i} />
                  <div className={common.personIdentity}>
                    <div className={common.personName}>Dr {d.name}</div>
                    <div className={common.personMeta}>
                      <span style={{ color: "var(--accent)", fontWeight: 500 }}>
                        {d.specialization}
                      </span>
                      <span>
                        <span className="num">{d.experience}</span> yrs
                      </span>
                      <span>Room {d.room}</span>
                      <span>{d.qualification}</span>
                    </div>
                  </div>
                  <div className={common.personTrail}>
                    <span className={`${styles.state} ${styles.stateActive}`}>Active</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p
        style={{
          marginTop: "var(--sp-4)",
          fontSize: "var(--fs-sm)",
          color: "var(--ink-3)",
        }}
      >
        <span className="num">{doctors.length}</span> doctors across{" "}
        <span className="num">{SPECIALTIES.length}</span> departments.
      </p>
    </div>
  );
}

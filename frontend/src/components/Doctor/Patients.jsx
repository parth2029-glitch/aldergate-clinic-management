import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CaretRight, MagnifyingGlass, Users } from "@phosphor-icons/react";
import { doctorService } from "../../services/doctorService";
import { fmtDate } from "../../lib/format";
import { PageHead, EmptyState, Monogram } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Doctor.module.css";

export default function Patients() {
  const [query, setQuery] = useState("");
  const [PATIENT_ROSTER, setPATIENT_ROSTER] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await doctorService.getDoctorPatients();
        setPATIENT_ROSTER(data);
      } catch (err) {
        setError(err.message || "Failed to load patients");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PATIENT_ROSTER.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [query, PATIENT_ROSTER]);

  if (loading) return <div className="shell page"><LoadingSpinner label="Loading patients..." /></div>;
  if (error) return <div className="shell page"><p className="error">{error}</p></div>;

  return (
    <div className="shell page">
      <PageHead
        title="My patients"
        lede="Everyone you have an appointment with. Opening a patient shows their full consultation history."
      />

      <div className={common.toolbar}>
        <div className={`field ${common.toolbarSearch}`}>
          <label className="sr-only" htmlFor="pt-search">
            Search patients by name
          </label>
          <div style={{ position: "relative" }}>
            <MagnifyingGlass
              size={16}
              color="var(--ink-3)"
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
              }}
              aria-hidden="true"
            />
            <input
              id="pt-search"
              className="field__control"
              style={{ paddingLeft: 34 }}
              placeholder="Search by name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <span className={common.toolbarCount}>
          <span className="num">{rows.length}</span> of{" "}
          <span className="num">{PATIENT_ROSTER.length}</span>
        </span>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No patient by that name"
            body="You can only see patients who have an appointment with you."
            action={
              <button className="btn btn--secondary btn--sm" onClick={() => setQuery("")}>
                Clear search
              </button>
            }
          />
        ) : (
          <ul className="rows">
            {rows.map((p, i) => {
              const records = p.recordsCount ?? p.visits ?? 0;
              return (
                <li key={p.id} className="settle" style={{ "--i": i }}>
                  <Link to={`/doctor/patients/${p.id}`} className={common.personRow} style={{ padding: "var(--sp-4) var(--sp-5)" }}>
                    <Monogram name={p.name} size={40} tone={i} />
                    <div className={common.personIdentity}>
                      <div className={common.personName}>
                        {p.name}
                        {p.visits === 0 && <span className={styles.newPatient}>First visit</span>}
                      </div>
                      <div className={common.personMeta}>
                        <span>
                          <span className="num">{p.age}</span> · {p.gender}
                        </span>
                        <span>Blood group {p.bloodGroup}</span>
                        <span>
                          <span className="num">{records}</span>{" "}
                          {records === 1 ? "record" : "records"}
                        </span>
                      </div>
                    </div>
                    <div className={common.personTrail}>
                      <span className={styles.lastSeen}>
                        {p.lastSeen ? (
                          <>
                            Last seen
                            <br />
                            <span className="num">{fmtDate(p.lastSeen)}</span>
                          </>
                        ) : (
                          "Not yet seen"
                        )}
                      </span>
                      <CaretRight size={16} color="var(--ink-3)" aria-hidden="true" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

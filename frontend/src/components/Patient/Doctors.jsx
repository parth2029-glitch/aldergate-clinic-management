import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CaretRight, MagnifyingGlass, UserList } from "@phosphor-icons/react";
import { SPECIALTIES } from "../../data/clinic";
import { doctorService } from "../../services/doctorService";
import { Monogram, PageHead, EmptyState } from "../ui/Bits";
import { RowsSkeleton } from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Patient.module.css";

export default function Doctors() {
  const [query, setQuery] = useState("");
  const [spec, setSpec] = useState("");
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    doctorService.getAllDoctors(spec)
      .then(setDoctors)
      .catch(err => setError(err.message || "Failed to load doctors."))
      .finally(() => setLoading(false));
  }, [spec]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchesQuery =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [query, doctors]);

  return (
    <div className="shell page">
      <PageHead
        title="Find a doctor"
        lede="Availability shown is for the coming week. Booking a slot holds it immediately."
      />

      <div className={common.toolbar}>
        <div className={`field ${common.toolbarSearch}`}>
          <label className="sr-only" htmlFor="doc-search">
            Search by name or department
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
              id="doc-search"
              className="field__control"
              style={{ paddingLeft: 34 }}
              placeholder="Search by name or department"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label className="sr-only" htmlFor="doc-spec">
            Filter by department
          </label>
          <select
            id="doc-spec"
            className="field__control"
            value={spec}
            onChange={(e) => setSpec(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="">All departments</option>
            {SPECIALTIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {!loading && !error && (
          <span className={common.toolbarCount}>
            <span className="num">{results.length}</span> of{" "}
            <span className="num">{doctors.length}</span>
          </span>
        )}
      </div>

      <div className="panel">
        {loading ? (
          <RowsSkeleton count={5} />
        ) : error ? (
          <EmptyState
            icon={UserList}
            title="Could not load doctors"
            body={error}
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon={UserList}
            title="No doctors match that"
            body="Try a different department, or clear the search to see everyone practising here."
            action={
              <button
                className="btn btn--secondary btn--sm"
                onClick={() => {
                  setQuery("");
                  setSpec("");
                }}
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <ul className="rows">
            {results.map((d, i) => (
              <li key={d.id} className="settle" style={{ "--i": i }}>
                <Link to={`/doctors/${d.id}`} className={styles.docRow}>
                  <Monogram name={d.name} tone={i} size={40} />

                  <div style={{ minWidth: 0 }}>
                    <div className={styles.docName}>Dr {d.name}</div>
                    <div className={styles.docMeta}>
                      <span className={styles.docSpec}>{d.specialization}</span>
                      <span>{d.experience} yrs</span>
                      <span>{d.qualification}</span>
                      <span>Room {d.room}</span>
                    </div>
                  </div>

                  <div className={styles.docTrail}>
                    <div className={styles.nextSlot}>
                      <span className={styles.nextSlotLabel}>Consults</span>
                      <span className={`${styles.nextSlotValue} ${d.days?.length ? "" : styles.full}`}>
                        {d.days?.length ? d.days.join(", ") : "No hours published"}
                      </span>
                    </div>
                    <CaretRight size={17} className={styles.arrow} aria-hidden="true" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

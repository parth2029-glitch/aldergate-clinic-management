import { useMemo, useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { doctorService } from "../../services/doctorService";
import { appointmentService } from "../../services/appointmentService";
import { useSession } from "../../state/session";
import { nextDays, dayName, fmtDate } from "../../lib/format";
import { Monogram, Notice } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Patient.module.css";

/* Keyed on the doctor. /patient/book/:doctorId → :doctorId is the same route,
   so React keeps the flow mounted across a param change and `booked` survives
   it — the held-slot screen then re-renders under a doctor nobody booked. */
export default function BookAppointment() {
  const { doctorId } = useParams();
  return <Booking key={doctorId} doctorId={doctorId} />;
}

function Booking({ doctorId }) {
  const { user } = useSession();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    doctorService.getDoctorById(doctorId)
      .then(setDoctor)
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [doctorId]);

  const days = useMemo(() => nextDays(7), []);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    if (!date || !doctor) return;
    setLoadingSlots(true);
    doctorService.getDoctorSlots(doctorId, date)
      .then((resp) => setAvailableSlots(resp?.availableSlots || []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, doctor, doctorId]);

  if (loading) return <div className="shell page"><LoadingSpinner label="Loading doctor..." /></div>;

  if (!doctor) {
    return (
      <div className="shell page">
        <h1>That doctor is not listed</h1>
        <Link to="/doctors" className="btn btn--primary" style={{ marginTop: "var(--sp-5)" }}>
          Back to all doctors
        </Link>
      </div>
    );
  }

  const consults = (iso) => doctor.days?.includes(dayName(iso));
  const allTaken = availableSlots.length === 0 && !loadingSlots;

  function confirm() {
    if (!date) return setError("Pick a date first.");
    if (!slot) return setError("Pick a time.");
    setError(null);
    setBusy(true);

    appointmentService.bookAppointment({ doctorId, date, time: slot, reason })
      .then(() => {
        setBooked(true);
      })
      .catch((err) => {
        if (err.status === 409) {
          setError("Slot taken by another patient. Please choose another.");
          // Refresh slots
          doctorService
            .getDoctorSlots(doctorId, date)
            .then((resp) => setAvailableSlots(resp?.availableSlots || []));
          setSlot(null);
        } else {
          setError(err.message || "Failed to book appointment.");
        }
      })
      .finally(() => setBusy(false));
  }

  if (booked) {
    return (
      <div className="shell page">
        <div style={{ maxWidth: "54ch" }}>
          <CheckCircle size={32} weight="fill" color="var(--accent)" />
          <h1 style={{ marginTop: "var(--sp-4)" }}>Your slot is held</h1>
          <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
            Dr {doctor.name} on <strong>{fmtDate(date)}</strong> at{" "}
            <strong className="num">{slot}</strong>, room {doctor.room}. It stays
            Pending until the clinic confirms it.
          </p>
          <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-6)", flexWrap: "wrap" }}>
            <Link to="/patient/appointments" className="btn btn--primary">
              See my appointments
            </Link>
            <Link to="/doctors" className="btn btn--secondary">
              Book another
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shell page">
      <Link to={`/doctors/${doctor.id}`} className={common.back}>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" />
        Dr {doctor.name}
      </Link>

      <h1 style={{ fontSize: "var(--fs-h1)", letterSpacing: "-0.028em" }}>
        Choose a time
      </h1>

      <div className={`${common.split} ${common.splitWide}`} style={{ marginTop: "var(--sp-6)" }}>
        <div>
          <section>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>
              <span className="num" style={{ color: "var(--ink-3)", marginRight: 8 }}>
                01
              </span>
              Date
            </h2>
            <div className={styles.days}>
              {days.map((d) => {
                const off = !consults(d.iso);
                return (
                  <button
                    key={d.iso}
                    type="button"
                    disabled={off}
                    onClick={() => {
                      setDate(d.iso);
                      setSlot(null);
                      setError(null);
                    }}
                    className={`${styles.day} ${date === d.iso ? styles.dayOn : ""} ${
                      off ? styles.dayOff : ""
                    }`}
                    aria-label={`${d.day} ${d.date}${off ? " — not consulting" : ""}`}
                  >
                    <span className={styles.dayName}>{d.day}</span>
                    <span className={styles.dayNum}>{d.date}</span>
                  </button>
                );
              })}
            </div>
            <p className="muted" style={{ marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>
              Dr {doctor.name} consults on {doctor.days.join(", ")}.
            </p>
          </section>

          <section style={{ marginTop: "var(--sp-7)" }}>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>
              <span className="num" style={{ color: "var(--ink-3)", marginRight: 8 }}>
                02
              </span>
              Time
            </h2>

            {!date ? (
              <p className="muted" style={{ marginTop: "var(--sp-3)", fontSize: "var(--fs-sm)" }}>
                Pick a date and the free times will appear here.
              </p>
            ) : loadingSlots ? (
              <div style={{ marginTop: "var(--sp-4)" }}>
                <LoadingSpinner label="Loading slots..." />
              </div>
            ) : (
              <>
                <div className={styles.slotGrid}>
                  {availableSlots.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSlot(s);
                        setError(null);
                      }}
                      className={`${styles.slot} ${slot === s ? styles.slotOn : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {allTaken ? (
                  <div style={{ marginTop: "var(--sp-3)" }}>
                    <Notice tone="info" icon={WarningCircle}>
                      Every time on this day is taken. Pick another date — Dr{" "}
                      {doctor.name} consults on {doctor.days.join(", ")}.
                    </Notice>
                  </div>
                ) : null}
              </>
            )}
          </section>

          <section style={{ marginTop: "var(--sp-7)" }}>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>
              <span className="num" style={{ color: "var(--ink-3)", marginRight: 8 }}>
                03
              </span>
              What is this about
            </h2>
            <div className="field" style={{ marginTop: "var(--sp-3)", maxWidth: "56ch" }}>
              <label className="sr-only" htmlFor="reason">
                Reason for the appointment
              </label>
              <textarea
                id="reason"
                className="field__control"
                placeholder="A sentence is enough — what is bothering you, and for how long."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={280}
              />
              <span className="field__hint">
                Optional, but it lets the doctor read your file before you arrive.{" "}
                <span className="num">{280 - reason.length}</span> characters left.
              </span>
            </div>
          </section>
        </div>

        <aside className={common.asideSticky}>
          <div className="panel">
            <div className="panel__head">
              <h2 style={{ fontSize: "var(--fs-h3)" }}>Summary</h2>
            </div>
            <div className="panel__body">
              <div
                style={{
                  display: "flex",
                  gap: "var(--sp-3)",
                  alignItems: "center",
                  paddingBottom: "var(--sp-4)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <Monogram name={doctor.name} size={38} tone={0} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, letterSpacing: "-0.012em" }}>
                    Dr {doctor.name}
                  </div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>
                    {doctor.specialization}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "var(--sp-2)" }}>
                <Row label="Date" value={date ? fmtDate(date) : "Not chosen"} pending={!date} />
                <Row label="Time" value={slot ?? "Not chosen"} pending={!slot} mono />
                <Row label="Room" value={doctor.room} mono />
                <Row label="Fee" value={`₹${doctor.fee}`} mono />
                <Row label="Patient" value={user?.name || "Patient"} />
              </div>

              {error && (
                <div style={{ marginTop: "var(--sp-4)" }}>
                  <Notice tone="error" icon={WarningCircle}>
                    {error}
                  </Notice>
                </div>
              )}

              <button
                className="btn btn--primary btn--block"
                style={{ marginTop: "var(--sp-4)" }}
                onClick={confirm}
                disabled={busy}
              >
                {busy ? <LoadingSpinner label="Holding your slot" /> : "Confirm appointment"}
              </button>

              <p
                style={{
                  marginTop: "var(--sp-3)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--ink-3)",
                  lineHeight: 1.6,
                }}
              >
                Slots are held on a first-come basis. If someone books this time
                while you are deciding, you will be told here and the list will
                refresh.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value, pending, mono }) {
  return (
    <div className={styles.summaryRow}>
      <span className={styles.summaryLabel}>{label}</span>
      <span
        className={`${styles.summaryValue} ${pending ? styles.pending : ""} ${
          mono && !pending ? "num" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}

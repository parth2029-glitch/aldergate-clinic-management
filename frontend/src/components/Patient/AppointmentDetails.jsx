import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, WarningCircle } from "@phosphor-icons/react";
import { CLINIC } from "../../data/clinic";
import { appointmentService } from "../../services/appointmentService";
import { doctorService } from "../../services/doctorService";
import { fmtDate, isPast } from "../../lib/format";
import { StatusTag, Facts, Monogram, Notice } from "../ui/Bits";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";

export default function AppointmentDetails() {
  const { id } = useParams();
  const [appt, setAppt] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  useEffect(() => {
    let alive = true;
    appointmentService
      .getAppointmentById(id)
      .then((a) => {
        if (!alive) return;
        setAppt(a);
        // The doctor card is a nicety; if it fails the appointment still renders.
        doctorService
          .getDoctorById(a.doctorId)
          .then((d) => alive && setDoctor(d))
          .catch(() => {});
      })
      .catch((err) => alive && setLoadError(err.message || "Could not load this appointment."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  async function cancel() {
    setBusy(true);
    setCancelError(null);
    try {
      // DELETE /api/appointments/{id} is a soft cancel, never a hard delete.
      await appointmentService.cancelAppointment(appt.id);
      setAppt((a) => ({ ...a, status: "Cancelled" }));
      setConfirming(false);
    } catch (err) {
      setCancelError(err.message || "Could not cancel this appointment.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="shell page">
        <LoadingSpinner label="Loading appointment..." />
      </div>
    );
  }

  if (loadError || !appt) {
    return (
      <div className="shell page">
        <h1>That appointment is not on file</h1>
        <Link to="/patient/appointments" className="btn btn--primary" style={{ marginTop: "var(--sp-5)" }}>
          Back to my appointments
        </Link>
      </div>
    );
  }

  const status = appt.status;
  const cancellable = status !== "Cancelled" && status !== "Completed" && !isPast(appt.date);

  return (
    <div className="shell page">
      <Link to="/patient/appointments" className={common.back}>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" />
        My appointments
      </Link>

      <div className={common.split}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "var(--sp-4)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ fontSize: "var(--fs-h1)", letterSpacing: "-0.028em" }}>
                {fmtDate(appt.date)} at <span className="num">{appt.time}</span>
              </h1>
              <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
                Dr {appt.doctorName} · {appt.specialization}
              </p>
            </div>
            <StatusTag status={status} />
          </div>

          {status === "Cancelled" && (
            <div style={{ marginTop: "var(--sp-5)" }}>
              <Notice tone="error" icon={WarningCircle}>
                This appointment is cancelled. It stays on your record so the history
                stays complete — book a new time whenever you are ready.
              </Notice>
            </div>
          )}

          <div style={{ marginTop: "var(--sp-6)", maxWidth: "60ch" }}>
            <Facts
              items={[
                { label: "Reason given", value: appt.reason },
                { label: "Consulting room", value: appt.room, mono: true },
                { label: "Department", value: appt.specialization },
                { label: "Booked on", value: fmtDate(appt.createdAt) },
                { label: "Reference", value: appt.id.toUpperCase(), mono: true },
              ]}
            />
          </div>

          {cancellable && (
            <div
              style={{
                marginTop: "var(--sp-6)",
                paddingTop: "var(--sp-5)",
                borderTop: "1px solid var(--line)",
              }}
            >
              {!confirming ? (
                <>
                  <h2 style={{ fontSize: "var(--fs-h3)" }}>Cannot make it?</h2>
                  <p
                    style={{
                      marginTop: "var(--sp-2)",
                      color: "var(--ink-2)",
                      fontSize: "var(--fs-sm)",
                      maxWidth: "56ch",
                      lineHeight: 1.6,
                    }}
                  >
                    Cancelling frees the slot for someone else straight away.
                  </p>
                  <button
                    className="btn btn--danger"
                    style={{ marginTop: "var(--sp-4)" }}
                    onClick={() => setConfirming(true)}
                  >
                    Cancel this appointment
                  </button>
                </>
              ) : (
                <div style={{ maxWidth: "56ch" }}>
                  <Notice tone="warn" icon={WarningCircle}>
                    Cancel {fmtDate(appt.date)} at {appt.time} with Dr{" "}
                    {appt.doctorName}? The slot is released immediately and you would
                    need to book again.
                  </Notice>
                  <div style={{ display: "flex", gap: "var(--sp-3)", marginTop: "var(--sp-4)" }}>
                    <button className="btn btn--danger" onClick={cancel} disabled={busy}>
                      {busy ? <LoadingSpinner label="Cancelling" /> : "Yes, cancel it"}
                    </button>
                    <button
                      className="btn btn--ghost"
                      onClick={() => setConfirming(false)}
                      disabled={busy}
                    >
                      Keep the appointment
                    </button>
                  </div>
                  {cancelError && (
                    <div style={{ marginTop: "var(--sp-3)" }}>
                      <Notice tone="error" icon={WarningCircle}>
                        {cancelError}
                      </Notice>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className={common.asideSticky}>
          {doctor && (
            <div className="panel">
              <div className="panel__body">
                <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center" }}>
                  <Monogram name={doctor.name} size={42} tone={0} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, letterSpacing: "-0.012em" }}>
                      Dr {doctor.name}
                    </div>
                    <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>
                      {doctor.qualification}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/doctors/${doctor.id}`}
                  className="btn btn--secondary btn--block"
                  style={{ marginTop: "var(--sp-4)" }}
                >
                  View profile
                </Link>
              </div>
            </div>
          )}

          <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
            <div className="panel__body">
              <span className="section-label">Getting there</span>
              <p
                style={{
                  marginTop: "var(--sp-3)",
                  fontSize: "var(--fs-sm)",
                  color: "var(--ink-2)",
                  lineHeight: 1.6,
                  display: "flex",
                  gap: 8,
                }}
              >
                <MapPin size={16} style={{ flex: "none", marginTop: 2 }} aria-hidden="true" />
                <span>
                  {CLINIC.line1}
                  <br />
                  {CLINIC.line2}
                  <br />
                  <span className="num">{CLINIC.phone}</span>
                </span>
              </p>
              <p
                style={{
                  marginTop: "var(--sp-4)",
                  paddingTop: "var(--sp-3)",
                  borderTop: "1px solid var(--line)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--ink-3)",
                }}
              >
                Arrive ten minutes early if this is your first visit to the department.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

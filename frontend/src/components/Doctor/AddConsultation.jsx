import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash, Check } from "@phosphor-icons/react";
import { medicalRecordService } from "../../services/medicalRecordService";
import { patientService } from "../../services/patientService";
import { useSession } from "../../state/session";
import { fmtDate, toISO } from "../../lib/format";
import { Notice, Monogram } from "../ui/Bits";
import { Field } from "../Auth/SignIn";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "./Doctor.module.css";

export default function AddConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSession();

  const [patient, setPatient] = useState(null);
  const [prior, setPrior] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [pt, recs] = await Promise.all([
          patientService.getPatientById(id),
          medicalRecordService.getPatientRecords(id)
        ]);
        setPatient(pt);
        if (recs && recs.length > 0) {
          const sortedRecs = [...recs].sort((a, b) => b.date.localeCompare(a.date));
          setPrior(sortedRecs[0]);
        }
      } catch (err) {
        setDataError(err.message || "Failed to load patient data");
      } finally {
        setDataLoading(false);
      }
    }
    loadData();
  }, [id]);

  const [values, setValues] = useState({
    date: toISO(new Date()),
    symptoms: "",
    diagnosis: "",
    notes: "",
    followUp: "",
  });
  const [rx, setRx] = useState([""]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (dataLoading) return <div className="shell page"><LoadingSpinner label="Loading..." /></div>;
  if (dataError) return <div className="shell page"><p className="error">{dataError}</p></div>;

  if (!patient) {
    return (
      <div className="shell page">
        <h1>No such patient</h1>
        <Link to="/doctor/patients" className="btn btn--primary" style={{ marginTop: "var(--sp-5)" }}>
          Back to my patients
        </Link>
      </div>
    );
  }

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!values.symptoms.trim()) next.symptoms = "Record what the patient described.";
    if (!values.diagnosis.trim())
      next.diagnosis = "A diagnosis is what the next doctor reads first.";
    if (!values.date) next.date = "Set the consultation date.";

    setErrors(next);
    if (Object.keys(next).length) return;

    async function saveRecord() {
      setBusy(true);
      try {
        await medicalRecordService.addRecord({
          patientId: id,
          ...values,
          prescription: rx.filter(Boolean),
        });
        navigate(`/doctor/patients/${id}`);
      } catch (err) {
        setErrors({ submit: err.message || "Failed to save record" });
      } finally {
        setBusy(false);
      }
    }
    saveRecord();
  }

  return (
    <div className="shell page">
      <Link to={`/doctor/patients/${id}`} className={common.back}>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" />
        {patient.name}
      </Link>

      <div className={common.split}>
        <div className={common.formPage}>
          <div style={{ display: "flex", gap: "var(--sp-4)", alignItems: "center" }}>
            <Monogram name={patient.name} size={46} tone={0} />
            <div>
              <h1 style={{ fontSize: "var(--fs-h1)", letterSpacing: "-0.028em" }}>
                New consultation
              </h1>
              <p style={{ marginTop: 2, color: "var(--ink-3)", fontSize: "var(--fs-sm)" }}>
                {patient.name} · <span className="num">{patient.age}</span> ·{" "}
                {patient.gender}
              </p>
            </div>
          </div>

          {prior && (
            <div className={styles.priorStrip} style={{ marginTop: "var(--sp-6)" }}>
              <span className={styles.priorLabel}>
                Last visit · {fmtDate(prior.date)}
              </span>
              <p className={styles.priorBody}>
                <strong>{prior.diagnosis}</strong> — {prior.followUp}
              </p>
            </div>
          )}

          <form onSubmit={submit} noValidate>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
              <Field
                id="date"
                label="Consultation date"
                type="date"
                value={values.date}
                onChange={set("date")}
                error={errors.date}
              />

              <Field
                id="symptoms"
                label="Symptoms and complaint"
                as="textarea"
                placeholder="What the patient described, in their terms where it matters, and for how long."
                value={values.symptoms}
                onChange={set("symptoms")}
                error={errors.symptoms}
              />

              <Field
                id="diagnosis"
                label="Diagnosis"
                placeholder="The finding, stated plainly."
                hint="This is the line shown collapsed in the history, so keep it specific."
                value={values.diagnosis}
                onChange={set("diagnosis")}
                error={errors.diagnosis}
              />

              <div className="field">
                <span className="field__label">Prescription</span>
                {rx.map((line, i) => (
                  <div className={styles.rxRow} key={i} style={{ marginTop: i ? 8 : 0 }}>
                    <input
                      className="field__control"
                      placeholder="Drug, dose, frequency, duration"
                      value={line}
                      aria-label={`Prescription line ${i + 1}`}
                      onChange={(e) =>
                        setRx((r) => r.map((v, j) => (j === i ? e.target.value : v)))
                      }
                    />
                    {rx.length > 1 && (
                      <button
                        type="button"
                        className="btn btn--ghost"
                        aria-label={`Remove prescription line ${i + 1}`}
                        onClick={() => setRx((r) => r.filter((_, j) => j !== i))}
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ marginTop: 8, alignSelf: "flex-start" }}
                  onClick={() => setRx((r) => [...r, ""])}
                >
                  <Plus size={14} weight="bold" />
                  Add another
                </button>
                <span className="field__hint">Leave blank if nothing was prescribed.</span>
              </div>

              <Field
                id="notes"
                label="Notes"
                as="textarea"
                placeholder="Examination findings, results, what was explained, what was ruled out."
                value={values.notes}
                onChange={set("notes")}
              />

              <Field
                id="followUp"
                label="Follow-up instructions"
                as="textarea"
                placeholder="When to come back, and what should bring them back sooner."
                value={values.followUp}
                onChange={set("followUp")}
              />
            </div>

            <div className={common.formActions}>
              <button className="btn btn--primary" disabled={busy}>
                {busy ? <LoadingSpinner label="Saving record" /> : "Save to record"}
              </button>
              <Link to={`/doctor/patients/${id}`} className="btn btn--ghost">
                Discard
              </Link>
            </div>
          </form>
        </div>

        <aside className={common.asideSticky}>
          <Notice tone="warn">
            Once saved, this entry is part of the patient&rsquo;s permanent record and
            is visible to them and to any doctor they later see here. Write it as
            something the next clinician has to be able to act on.
          </Notice>

          <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
            <div className="panel__body">
              <span className="section-label">Signing as</span>
              <p style={{ marginTop: "var(--sp-3)", fontWeight: 700, letterSpacing: "-0.012em" }}>
                Dr {user?.name || "-"}
              </p>
              <p style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>
                {user?.specialization || "-"} · Room {user?.room || "-"}
              </p>
              <p
                style={{
                  marginTop: "var(--sp-4)",
                  paddingTop: "var(--sp-3)",
                  borderTop: "1px solid var(--line)",
                  fontSize: "var(--fs-xs)",
                  color: "var(--ink-3)",
                  display: "flex",
                  gap: 7,
                  lineHeight: 1.6,
                }}
              >
                <Check size={14} weight="bold" style={{ flex: "none", marginTop: 2 }} aria-hidden="true" />
                Your name and the date are attached automatically.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

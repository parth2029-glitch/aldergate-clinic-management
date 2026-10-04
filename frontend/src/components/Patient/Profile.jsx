import { useState, useEffect } from "react";
import { Check, ShieldCheck } from "@phosphor-icons/react";
import { patientService } from "../../services/patientService";
import { fmtDate } from "../../lib/format";
import { PageHead, Notice, Monogram } from "../ui/Bits";
import { Field } from "../Auth/SignIn";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";

export default function Profile() {
  const [values, setValues] = useState(null);
  const [registeredAt, setRegisteredAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    patientService
      .getPatientByUserId()
      .then((p) => {
        if (!alive) return;
        setValues({
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          age: p.age != null ? String(p.age) : "",
          gender: p.gender || "Prefer not to say",
          bloodGroup: p.bloodGroup || "",
          address: p.address || "",
        });
        setRegisteredAt(p.registeredAt);
      })
      .catch((err) => alive && setLoadError(err.message || "Could not load your details."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
    setSaved(false);
  };

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Your record needs a name on it.";
    if (!values.phone.trim()) next.phone = "Enter a number the clinic can reach you on.";
    if (!values.age || Number(values.age) < 0 || Number(values.age) > 120)
      next.age = "Enter an age between 0 and 120.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await patientService.updatePatient({
        name: values.name,
        age: Number(values.age),
        gender: values.gender,
        phone: values.phone,
        bloodGroup: values.bloodGroup,
        address: values.address,
      });
      setSaved(true);
    } catch (err) {
      setErrors({ submit: err.message || "Could not save your details." });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="shell page">
        <LoadingSpinner label="Loading your details..." />
      </div>
    );
  }
  if (loadError || !values) {
    return (
      <div className="shell page">
        <p className="error">{loadError || "Could not load your details."}</p>
      </div>
    );
  }

  return (
    <div className="shell page">
      <PageHead
        title="Your details"
        lede="These are shown to a doctor when you have an appointment with them, and to nobody else."
      />

      <div className={common.split}>
        <form onSubmit={submit} noValidate className={common.formPage}>
          <div className="form-grid">
            <Field
              id="name"
              label="Full name"
              value={values.name}
              onChange={set("name")}
              error={errors.name}
              autoComplete="name"
            />
            <Field
              id="email"
              label="Email"
              type="email"
              value={values.email}
              onChange={set("email")}
              hint="Set at registration and not changed here."
              autoComplete="email"
              disabled
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              value={values.phone}
              onChange={set("phone")}
              error={errors.phone}
              autoComplete="tel"
            />
            <Field
              id="age"
              label="Age"
              type="number"
              min="0"
              max="120"
              value={values.age}
              onChange={set("age")}
              error={errors.age}
            />
            <Field id="gender" label="Gender" as="select" value={values.gender} onChange={set("gender")}>
              <option>Prefer not to say</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </Field>
            <Field
              id="blood"
              label="Blood group"
              as="select"
              value={values.bloodGroup}
              onChange={set("bloodGroup")}
              hint="Optional, but useful in an emergency."
            >
              <option value="">Not known</option>
              {["O+", "O−", "A+", "A−", "B+", "B−", "AB+", "AB−"].map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Field>
            <div className="field field--wide">
              <label className="field__label" htmlFor="address">
                Address
              </label>
              <textarea
                id="address"
                className="field__control"
                style={{ minHeight: 76 }}
                value={values.address}
                onChange={set("address")}
              />
            </div>
          </div>

          {errors.submit && (
            <div style={{ marginTop: "var(--sp-4)" }}>
              <Notice tone="error">{errors.submit}</Notice>
            </div>
          )}

          <div className={common.formActions}>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? <LoadingSpinner label="Saving" /> : "Save changes"}
            </button>
            {saved && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  color: "var(--accent)",
                  fontSize: "var(--fs-sm)",
                  fontWeight: 500,
                }}
              >
                <Check size={15} weight="bold" aria-hidden="true" />
                Saved
              </span>
            )}
          </div>
        </form>

        <aside className={common.asideSticky}>
          <div className="panel">
            <div className="panel__body">
              <div style={{ display: "flex", gap: "var(--sp-3)", alignItems: "center" }}>
                <Monogram name={values.name} size={44} tone={2} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, letterSpacing: "-0.012em" }}>{values.name}</div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--ink-3)" }}>
                    Patient since {registeredAt ? fmtDate(registeredAt) : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--sp-4)" }}>
            <Notice tone="info" icon={ShieldCheck}>
              Changing your details here does not change what is already written in
              past consultation records. Those are fixed once a doctor signs them.
            </Notice>
          </div>
        </aside>
      </div>
    </div>
  );
}

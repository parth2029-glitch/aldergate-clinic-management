import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Info } from "@phosphor-icons/react";
import { SPECIALTIES } from "../../data/clinic";
import { adminService } from "../../services/adminService";
import { Notice } from "../ui/Bits";
import { Field } from "../Auth/SignIn";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";

export default function AddDoctor() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    qualification: "",
    experience: "",
    room: "",
    fee: "",
    about: "",
    languages: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "Enter the doctor's full name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email))
      next.email = "A working email — their sign-in details go here.";
    if (!values.password || values.password.length < 6)
      next.password = "At least six characters. They can change it after signing in.";
    if (!values.specialization) next.specialization = "Pick a department.";
    if (!values.qualification.trim()) next.qualification = "Enter their qualification.";
    if (values.experience === "" || Number(values.experience) < 0)
      next.experience = "Enter years of experience.";
    if (!values.room.trim()) next.room = "Enter a consulting room.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    try {
      await adminService.createDoctor({
        name: values.name,
        email: values.email,
        password: values.password,
        specialization: values.specialization,
        qualification: values.qualification,
        experience: Number(values.experience) || 0,
        fee: values.fee === "" ? 0 : Number(values.fee),
        room: values.room,
        about: values.about,
        languages: values.languages
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
      });
      navigate("/admin");
    } catch (err) {
      setErrors({ submit: err.message || "Could not create the doctor account." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="shell page">
      <Link to="/admin" className={common.back}>
        <ArrowLeft size={15} weight="bold" aria-hidden="true" />
        Doctors
      </Link>

      <div className={common.split}>
        <div className={common.formPage}>
          <h1 style={{ fontSize: "var(--fs-h1)", letterSpacing: "-0.028em" }}>
            Add a doctor
          </h1>
          <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
            This creates their account and makes them bookable by patients.
          </p>

          <form onSubmit={submit} noValidate style={{ marginTop: "var(--sp-6)" }}>
            <div className="form-grid">
              <Field
                id="name"
                label="Full name"
                value={values.name}
                onChange={set("name")}
                error={errors.name}
                hint="Without the Dr prefix."
              />
              <Field
                id="email"
                label="Work email"
                type="email"
                value={values.email}
                onChange={set("email")}
                error={errors.email}
              />
              <Field
                id="password"
                label="Temporary password"
                type="password"
                autoComplete="new-password"
                value={values.password}
                onChange={set("password")}
                error={errors.password}
                hint="At least six characters."
              />
              <Field
                id="specialization"
                label="Department"
                as="select"
                value={values.specialization}
                onChange={set("specialization")}
                error={errors.specialization}
              >
                <option value="">Choose a department</option>
                {SPECIALTIES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Field>
              <Field
                id="qualification"
                label="Qualification"
                placeholder="MD, DM Cardiology"
                value={values.qualification}
                onChange={set("qualification")}
                error={errors.qualification}
              />
              <Field
                id="experience"
                label="Years of experience"
                type="number"
                min="0"
                max="60"
                value={values.experience}
                onChange={set("experience")}
                error={errors.experience}
              />
              <Field
                id="room"
                label="Consulting room"
                placeholder="2.14"
                value={values.room}
                onChange={set("room")}
                error={errors.room}
              />
              <Field
                id="fee"
                label="Consultation fee (₹)"
                type="number"
                min="0"
                value={values.fee}
                onChange={set("fee")}
                hint="Can be set later."
              />
              <div className="field field--wide">
                <label className="field__label" htmlFor="about">
                  About
                </label>
                <textarea
                  id="about"
                  className="field__control"
                  placeholder="What they see, and anything a patient should know before booking."
                  value={values.about}
                  onChange={set("about")}
                />
                <span className="field__hint">
                  Shown on their public profile. They can edit this themselves later.
                </span>
              </div>
              <div className="field field--wide">
                <label className="field__label" htmlFor="languages">
                  Languages
                </label>
                <input
                  id="languages"
                  className="field__control"
                  placeholder="English, Kannada, Tamil"
                  value={values.languages}
                  onChange={set("languages")}
                />
                <span className="field__hint">Comma-separated.</span>
              </div>
            </div>

            {errors.submit && (
              <div style={{ marginTop: "var(--sp-4)" }}>
                <Notice tone="error">{errors.submit}</Notice>
              </div>
            )}

            <div className={common.formActions}>
              <button className="btn btn--primary" disabled={busy}>
                {busy ? <LoadingSpinner label="Creating account" /> : "Create doctor account"}
              </button>
              <Link to="/admin" className="btn btn--ghost">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        <aside className={common.asideSticky}>
          <Notice tone="warn" icon={Info}>
            Creating this account gives the doctor access to the records of every
            patient who books with them. Only add people who should have it.
          </Notice>

          <div className="panel" style={{ marginTop: "var(--sp-4)" }}>
            <div className="panel__body">
              <span className="section-label">What happens next</span>
              <ol
                style={{
                  margin: "var(--sp-3) 0 0",
                  paddingLeft: "1.1rem",
                  fontSize: "var(--fs-sm)",
                  color: "var(--ink-2)",
                  lineHeight: 1.7,
                  display: "grid",
                  gap: 6,
                }}
              >
                <li>The account is created with a temporary password.</li>
                <li>They set their own availability on first sign-in.</li>
                <li>Patients can book them once slots are published.</li>
              </ol>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

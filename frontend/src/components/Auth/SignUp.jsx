import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, ShieldCheck } from "@phosphor-icons/react";
import LoadingSpinner from "../LoadingSpinner";
import { Notice } from "../ui/Bits";
import { Field } from "./SignIn";
import { useSession } from "../../state/session";
import styles from "./Auth.module.css";

export default function SignUp() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { register } = useSession();
  const navigate = useNavigate();

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!values.name.trim()) next.name = "We need a name for your record.";
    if (!values.email.trim()) next.email = "Enter an email address.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      next.email = "That does not look like an email address.";
    if (!values.phone.trim()) next.phone = "Enter a number the clinic can reach you on.";
    if (!values.age) next.age = "Enter your age.";
    else if (Number(values.age) < 0 || Number(values.age) > 120)
      next.age = "Enter an age between 0 and 120.";
    if (!values.password) next.password = "Choose a password.";
    else if (values.password.length < 8)
      next.password = "Use at least 8 characters.";

    setErrors(next);
    if (Object.keys(next).length) return;

    // Phase 2 posts to /api/auth/register.
    setBusy(true);
    register(values)
      .then(() => {
        navigate("/patient");
      })
      .catch((err) => {
        setErrors({ email: err.message || "Registration failed." });
        setBusy(false);
      });
  }

  return (
    <div className={`shell ${styles.wrap}`}>
      <div className={styles.form}>
        <h1 className={styles.title}>Create a patient account</h1>
        <p className={styles.sub}>
          This is the file your consultation history will be written into, so the
          details should match what you would tell a doctor.
        </p>

        <form onSubmit={submit} noValidate>
          <div className={styles.fields}>
            <Field
              id="name"
              label="Full name"
              autoComplete="name"
              value={values.name}
              onChange={set("name")}
              error={errors.name}
            />
            <Field
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={set("email")}
              error={errors.email}
            />
            <Field
              id="phone"
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 98204 71336"
              value={values.phone}
              onChange={set("phone")}
              error={errors.phone}
            />

            <div className="form-grid">
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
              <Field
                id="gender"
                label="Gender"
                as="select"
                value={values.gender}
                onChange={set("gender")}
                error={errors.gender}
              >
                <option value="">Prefer not to say</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </Field>
            </div>

            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint="At least 8 characters."
              value={values.password}
              onChange={set("password")}
              error={errors.password}
            />
          </div>

          <button
            className={`btn btn--primary btn--lg btn--block ${styles.submit}`}
            disabled={busy}
          >
            {busy ? <LoadingSpinner label="Creating your account" /> : "Create account"}
          </button>
        </form>

        <p className={styles.alt}>
          Already registered? <Link to="/login">Sign in</Link>.
        </p>
      </div>

      <aside className={styles.aside}>
        <Notice tone="info" icon={Info}>
          Only patients register here. Doctor accounts are created by the clinic
          office, so that nobody can give themselves access to patient records by
          signing up.
        </Notice>

        <h2 className={styles.asideTitle} style={{ marginTop: "var(--sp-5)" }}>
          What happens to your details
        </h2>
        <ul className={styles.asideList}>
          <li className={styles.asideItem}>
            <ShieldCheck size={17} color="var(--accent)" aria-hidden="true" />
            <span>
              Your password is stored hashed, never in readable form.
            </span>
          </li>
          <li className={styles.asideItem}>
            <ShieldCheck size={17} color="var(--accent)" aria-hidden="true" />
            <span>
              Your name, age and contact details are shown to a doctor only when you
              have an appointment with them.
            </span>
          </li>
        </ul>

        <p className={styles.demoBox}>
          Static preview: nothing is submitted anywhere. The form validates locally
          and then opens the patient area.
        </p>
      </aside>
    </div>
  );
}

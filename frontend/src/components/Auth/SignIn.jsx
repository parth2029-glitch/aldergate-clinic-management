import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { WarningCircle, ShieldCheck, ClockCounterClockwise, IdentificationCard } from "@phosphor-icons/react";
import LoadingSpinner from "../LoadingSpinner";
import { useSession } from "../../state/session";
import styles from "./Auth.module.css";

export default function SignIn() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const { login } = useSession();
  const navigate = useNavigate();

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((x) => ({ ...x, [k]: undefined }));
  };

  function submit(e) {
    e.preventDefault();
    const next = {};
    if (!values.email.trim()) next.email = "Enter the email you registered with.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email))
      next.email = "That does not look like an email address.";
    if (!values.password) next.password = "Enter your password.";

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    login(values.email, values.password)
      .then((data) => {
        const role = data?.user?.role?.toLowerCase();
        navigate(role === "doctor" ? "/doctor" : role === "admin" ? "/admin" : "/patient");
      })
      .catch((err) => {
        setErrors({ email: err.message || "Login failed. Please check your credentials." });
        setBusy(false);
      });
  }

  return (
    <div className={`shell ${styles.wrap}`}>
      <div className={styles.form}>
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.sub}>
          Your appointments and your consultation history are behind this.
        </p>

        <form onSubmit={submit} noValidate>
          <div className={styles.fields}>
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
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={set("password")}
              error={errors.password}
            />
          </div>

          <button
            className={`btn btn--primary btn--lg btn--block ${styles.submit}`}
            disabled={busy}
          >
            {busy ? <LoadingSpinner label="Signing in" /> : "Sign in"}
          </button>
        </form>

        <p className={styles.alt}>
          No account yet? <Link to="/register">Register as a patient</Link>. Doctors
          are added by the clinic office, not through this form.
        </p>
      </div>

      <aside className={styles.aside}>
        <h2 className={styles.asideTitle}>What signing in gives you</h2>
        <ul className={styles.asideList}>
          <li className={styles.asideItem}>
            <ClockCounterClockwise size={17} color="var(--accent)" aria-hidden="true" />
            <span>Every consultation you have had here, in one dated list.</span>
          </li>
          <li className={styles.asideItem}>
            <IdentificationCard size={17} color="var(--accent)" aria-hidden="true" />
            <span>Booking without re-entering your details each time.</span>
          </li>
          <li className={styles.asideItem}>
            <ShieldCheck size={17} color="var(--accent)" aria-hidden="true" />
            <span>
              Your record is yours. No other patient can open it, and only a doctor
              you have an appointment with can read it.
            </span>
          </li>
        </ul>

        <p className={styles.demoBox}>
          Your credentials are checked by the clinic API. Every doctor, patient and
          record in this project is invented.
        </p>
      </aside>
    </div>
  );
}

export function Field({ id, label, error, hint, as, children, ...rest }) {
  const Tag = as ?? "input";
  return (
    <div className={`field ${error ? "field--invalid" : ""}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <Tag
        id={id}
        className="field__control"
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        {...rest}
      >
        {children}
      </Tag>
      {hint && !error && (
        <span className="field__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error" id={`${id}-err`}>
          <WarningCircle size={14} weight="fill" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

import { Clock, CheckCircle, Check, XCircle } from "@phosphor-icons/react";
import styles from "./Bits.module.css";

/* --- Appointment status -------------------------------------------------
   Each state carries an icon and a word as well as a colour, so the four
   remain distinguishable to someone who cannot separate the hues. */

const STATUS = {
  Pending: { cls: "tag--pending", Icon: Clock },
  Confirmed: { cls: "tag--confirmed", Icon: CheckCircle },
  Completed: { cls: "tag--completed", Icon: Check },
  Cancelled: { cls: "tag--cancelled", Icon: XCircle },
};

export function StatusTag({ status }) {
  const { cls, Icon } = STATUS[status] ?? STATUS.Pending;
  return (
    <span className={`tag ${cls}`}>
      <Icon size={13} weight="bold" aria-hidden="true" />
      {status}
    </span>
  );
}

/* --- Monogram -----------------------------------------------------------
   Deliberately not a photograph. Inventing faces for fictional doctors
   risks presenting a real person as a practitioner at this clinic. */

export function Monogram({ name, size = 38, tone = 0 }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const hue = [28, 96, 168, 206, 254, 340][tone % 6];

  return (
    <span
      className={styles.monogram}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `hsl(${hue} 32% 94%)`,
        color: `hsl(${hue} 44% 26%)`,
        borderColor: `hsl(${hue} 28% 86%)`,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}

/* --- Page heading ------------------------------------------------------- */

export function PageHead({ title, lede, actions, meta }) {
  return (
    <header className={styles.head}>
      <div className={styles.headText}>
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {meta && <p className={styles.meta}>{meta}</p>}
      </div>
      {actions && <div className={styles.headActions}>{actions}</div>}
    </header>
  );
}

/* --- Empty state -------------------------------------------------------- */

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className={styles.empty}>
      {Icon && <Icon size={26} color="var(--ink-3)" aria-hidden="true" />}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {body && <p className={styles.emptyBody}>{body}</p>}
      {action}
    </div>
  );
}

/* --- Definition list ---------------------------------------------------- */

export function Facts({ items }) {
  return (
    <dl className={styles.facts}>
      {items.map(({ label, value, mono }) => (
        <div className={styles.fact} key={label}>
          <dt className={styles.factLabel}>{label}</dt>
          <dd className={`${styles.factValue} ${mono ? "num" : ""}`}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* --- Inline notice ------------------------------------------------------ */

export function Notice({ tone = "info", icon: Icon, children }) {
  return (
    <div className={`${styles.notice} ${styles[`notice--${tone}`]}`} role="status">
      {Icon && <Icon size={17} aria-hidden="true" />}
      <div>{children}</div>
    </div>
  );
}

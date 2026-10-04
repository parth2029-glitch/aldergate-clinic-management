import styles from "./LoadingSpinner.module.css";

/* Skeletons matched to the layout they replace, rather than a spinner
   floating in empty space. */

export function RowsSkeleton({ count = 4 }) {
  return (
    <div className={styles.rows} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div className={styles.row} key={i}>
          <div className={`skeleton ${styles.avatar}`} />
          <div className={styles.lines}>
            <div className={`skeleton ${styles.line}`} style={{ width: "38%" }} />
            <div className={`skeleton ${styles.line}`} style={{ width: "58%" }} />
          </div>
          <div className={`skeleton ${styles.pill}`} />
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className={styles.inline} role="status">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className="sr-only">{label}</span>
    </div>
  );
}

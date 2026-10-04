import { Link } from "react-router-dom";
import { ArrowRight, CalendarCheck, FileText, NotePencil } from "@phosphor-icons/react";
import { DOCTORS, SPECIALTIES, MEDICAL_RECORDS, CLINIC } from "../../data/clinic";
import styles from "./Home.module.css";

const record = MEDICAL_RECORDS["p-1"][0];

const countFor = (s) => DOCTORS.filter((d) => d.specialization === s).length;

export default function Home() {
  return (
    <>
      <section className={`shell ${styles.hero}`}>
        <div className={styles.heroText}>
          <h1 className={`display ${styles.title}`}>
            Every visit starts with the last one.
          </h1>
          <p className={`lede ${styles.lede}`}>
            {CLINIC.name} keeps your appointments and your consultation notes in one
            file. When you sit down in February, your doctor has already read what
            happened in September.
          </p>

          <div className={styles.actions}>
            <Link to="/doctors" className="btn btn--primary btn--lg">
              Find a doctor
              <ArrowRight size={17} weight="bold" />
            </Link>
            <Link to="/register" className="btn btn--secondary btn--lg">
              Create an account
            </Link>
          </div>

          <div className={styles.specStrip}>
            <span className="section-label">Departments</span>
            <ul className={styles.chips}>
              {SPECIALTIES.map((s) => (
                <li key={s}>
                  <Link to="/doctors" className={styles.chip}>
                    {s}
                    <span className={`num ${styles.chipNum}`}>{countFor(s)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Shows the thing itself: what a doctor opens before a consultation. */}
        <aside className={styles.recordWrap} aria-label="Example consultation record">
          <div className={styles.recordChrome}>
            <span className="section-label">Consultation record</span>
            <span className={`num ${styles.recordDate}`}>{record.date}</span>
          </div>

          <article className={styles.record}>
            <header className={styles.recordHead}>
              <h2 className={styles.recordDoctor}>Dr {record.doctor}</h2>
              <p className={styles.recordSpec}>{record.specialization}</p>
            </header>

            <Line label="Symptoms" value={record.symptoms} />
            <Line label="Diagnosis" value={record.diagnosis} strong />
            <Line label="Prescription" value={record.prescription.join(" · ")} mono />
            <Line label="Follow-up" value={record.followUp} />
          </article>

          <p className={styles.recordFoot}>
            Invented record, shown as an example. No real patient is represented.
          </p>
        </aside>
      </section>

      <section className={`shell ${styles.flow}`}>
        <h2 className={styles.flowTitle}>How a record builds</h2>
        <ol className={styles.steps}>
          <Step
            n="01"
            icon={CalendarCheck}
            title="You book a time"
            body="Pick a doctor, a date, and a slot that is actually free. Two people can never hold the same slot."
          />
          <Step
            n="02"
            icon={FileText}
            title="Your doctor opens the file"
            body="Before the consultation starts, they read the previous visits — symptoms, diagnosis, what was prescribed, what to watch for."
          />
          <Step
            n="03"
            icon={NotePencil}
            title="The visit is written down"
            body="What was found and what was prescribed goes into the same file, dated and attributed."
          />
          <Step
            n="04"
            icon={ArrowRight}
            title="Next time, it is already there"
            body="Nothing is re-explained from memory. The file is the continuity."
          />
        </ol>
      </section>

      <section className={`shell ${styles.close}`}>
        <div>
          <h2 className={styles.closeTitle}>
            {DOCTORS.length} doctors across {SPECIALTIES.length} departments.
          </h2>
          <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
            {CLINIC.hours} · {CLINIC.line1}, {CLINIC.line2}
          </p>
        </div>
        <Link to="/doctors" className="btn btn--primary btn--lg">
          See who is available
          <ArrowRight size={17} weight="bold" />
        </Link>
      </section>
    </>
  );
}

function Line({ label, value, strong, mono }) {
  return (
    <div className={styles.recordLine}>
      <dt className={styles.recordLabel}>{label}</dt>
      <dd
        className={`${styles.recordValue} ${strong ? styles.recordStrong : ""} ${
          mono ? "num" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Step({ n, icon: Icon, title, body }) {
  return (
    <li className={styles.step}>
      <span className={`num ${styles.stepNum}`}>{n}</span>
      <div className={styles.stepIcon}>
        <Icon size={19} color="var(--accent)" aria-hidden="true" />
      </div>
      <div>
        <h3>{title}</h3>
        <p className={styles.stepBody}>{body}</p>
      </div>
    </li>
  );
}

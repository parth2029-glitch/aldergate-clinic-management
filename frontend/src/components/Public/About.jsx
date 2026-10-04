import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { CLINIC, DOCTORS, SPECIALTIES } from "../../data/clinic";
import { Facts, Notice } from "../ui/Bits";
import common from "../common.module.css";
import styles from "./About.module.css";

export default function About() {
  return (
    <div className="shell page">
      <div className={common.split}>
        <div>
          <h1 className={styles.title}>
            A clinic record that does not restart at every visit.
          </h1>

          <div className={styles.prose}>
            <p>
              {CLINIC.name} runs {DOCTORS.length} doctors across{" "}
              {SPECIALTIES.length} departments. Patients book their own
              appointments; the clinic office adds the doctors.
            </p>
            <p>
              The part worth explaining is what happens after the appointment. When
              a doctor finishes a consultation they write down what they found,
              what they prescribed, and what to watch for. That entry is attached to
              the patient, not to the appointment, so it is still there at the next
              visit — and the one after that.
            </p>
            <p>
              It means a patient is not asked to remember the name of a drug they
              took eight months ago, and a doctor seeing someone for the second time
              is not starting from a blank page.
            </p>
          </div>

          <h2 className={styles.sub}>Who can see what</h2>
          <div className={styles.prose}>
            <p>
              A patient can open their own appointments and their own record, and
              nobody else&rsquo;s. A doctor can open the record of a patient they
              have an appointment with. Those rules are enforced on the server, not
              by hiding buttons.
            </p>
          </div>

          <Notice tone="warn">
            This is a coursework build. Every doctor, patient, appointment and
            consultation note in the interface is invented, and no part of it should
            be read as medical information.
          </Notice>
        </div>

        <aside className={common.asideSticky}>
          <div className="panel">
            <div className="panel__head">
              <h2 style={{ fontSize: "var(--fs-h3)" }}>Practice details</h2>
            </div>
            <div className="panel__body">
              <Facts
                items={[
                  { label: "Address", value: `${CLINIC.line1}, ${CLINIC.line2}` },
                  { label: "Telephone", value: CLINIC.phone, mono: true },
                  { label: "Opening hours", value: CLINIC.hours },
                  { label: "Departments", value: SPECIALTIES.length, mono: true },
                  { label: "Doctors", value: DOCTORS.length, mono: true },
                ]}
              />
              <Link
                to="/doctors"
                className="btn btn--secondary btn--block"
                style={{ marginTop: "var(--sp-5)" }}
              >
                Browse doctors
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

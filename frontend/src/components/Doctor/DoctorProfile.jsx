import { useState, useEffect } from "react";
import { Check } from "@phosphor-icons/react";
import { doctorService } from "../../services/doctorService";
import { useSession } from "../../state/session";
import { PageHead, Monogram, Notice, Facts } from "../ui/Bits";
import { Field } from "../Auth/SignIn";
import LoadingSpinner from "../LoadingSpinner";
import common from "../common.module.css";
import styles from "../Patient/Patient.module.css";

// Ordered Sunday-last to match the working week; `key` is what the API's
// availability template uses, `label` is what the doctor reads.
const WEEK = [
  { label: "Mon", key: "MONDAY" },
  { label: "Tue", key: "TUESDAY" },
  { label: "Wed", key: "WEDNESDAY" },
  { label: "Thu", key: "THURSDAY" },
  { label: "Fri", key: "FRIDAY" },
  { label: "Sat", key: "SATURDAY" },
  { label: "Sun", key: "SUNDAY" },
];
const ALL_SLOTS = [
  "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
  "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];
const SLOT_MINUTES = 30;

function addMinutes(hhmm, minutes) {
  const [h, m] = hhmm.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const hh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function DoctorProfile() {
  const { user } = useSession();
  const [doctor, setDoctor] = useState(null);
  const [about, setAbout] = useState("");
  const [fee, setFee] = useState("");
  const [days, setDays] = useState(new Set());
  const [slots, setSlots] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!user?.profileId) {
      setLoadError("This account has no doctor profile.");
      setLoading(false);
      return;
    }
    doctorService
      .getDoctorById(user.profileId)
      .then((d) => {
        if (!alive) return;
        setDoctor(d);
        setAbout(d.about || "");
        setFee(d.fee != null ? String(d.fee) : "");
        const weekly = d.availability?.weekly || {};
        setDays(new Set(WEEK.filter((w) => (weekly[w.key] || []).length).map((w) => w.label)));
        const starts = new Set();
        Object.values(weekly).forEach((ranges) =>
          (ranges || []).forEach((r) => starts.add(r.start)),
        );
        setSlots(starts);
      })
      .catch((err) => alive && setLoadError(err.message || "Could not load your profile."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [user?.profileId]);

  const toggle = (setter) => (v) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
    setSaved(false);
  };

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setSaveError(null);
    try {
      // Rebuild the weekly template from the day/slot toggles. Each selected
      // time becomes one 30-minute range on each selected day — the same shape
      // the seed data and the slot calculator expect.
      const weekly = {};
      [...days].forEach((label) => {
        const day = WEEK.find((w) => w.label === label);
        weekly[day.key] = [...slots]
          .sort()
          .map((s) => ({ start: s, end: addMinutes(s, SLOT_MINUTES) }));
      });
      const updated = await doctorService.updateDoctor({
        about,
        fee: fee === "" ? 0 : Number(fee),
        availability: { slotMinutes: SLOT_MINUTES, weekly },
      });
      setDoctor(updated);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message || "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="shell page">
        <LoadingSpinner label="Loading your profile..." />
      </div>
    );
  }
  if (loadError || !doctor) {
    return (
      <div className="shell page">
        <p className="error">{loadError || "Could not load your profile."}</p>
      </div>
    );
  }

  return (
    <div className="shell page">
      <PageHead
        title="Your profile and availability"
        lede="What patients see when they look you up, and the times they can book."
      />

      <div className={common.split}>
        <form onSubmit={submit} className={common.formPage}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
            <Field
              id="spec"
              label="Department"
              value={doctor.specialization}
              readOnly
              disabled
              hint="Set by the clinic office and not editable here."
            />

            <Field
              id="about"
              label="About"
              as="textarea"
              hint="Shown on your public profile. What you see, and anything a patient should know before booking."
              value={about}
              onChange={(e) => {
                setAbout(e.target.value);
                setSaved(false);
              }}
            />

            <Field
              id="fee"
              label="Consultation fee (₹)"
              type="number"
              min="0"
              value={fee}
              onChange={(e) => {
                setFee(e.target.value);
                setSaved(false);
              }}
            />
          </div>

          <section style={{ marginTop: "var(--sp-6)" }}>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>Days you consult</h2>
            <div className={styles.days} style={{ overflowX: "visible", flexWrap: "wrap" }}>
              {WEEK.map(({ label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggle(setDays)(label)}
                  className={`${styles.day} ${days.has(label) ? styles.dayOn : ""}`}
                  aria-pressed={days.has(label)}
                  style={{ minWidth: 58 }}
                >
                  <span className={styles.dayName}>{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section style={{ marginTop: "var(--sp-6)" }}>
            <h2 style={{ fontSize: "var(--fs-h3)" }}>Slots offered</h2>
            <p className="muted" style={{ marginTop: "var(--sp-2)", fontSize: "var(--fs-sm)" }}>
              Thirty minutes each. Patients can only book a time you have selected.
            </p>
            <div className={styles.slotGrid}>
              {ALL_SLOTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(setSlots)(s)}
                  className={`${styles.slot} ${slots.has(s) ? styles.slotOn : ""}`}
                  aria-pressed={slots.has(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {saveError && (
            <div style={{ marginTop: "var(--sp-4)" }}>
              <Notice tone="error">{saveError}</Notice>
            </div>
          )}

          <div className={common.formActions}>
            <button className="btn btn--primary" disabled={busy}>
              {busy ? <LoadingSpinner label="Saving" /> : "Save profile"}
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
                <Monogram name={doctor.name} size={46} tone={0} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, letterSpacing: "-0.012em" }}>
                    Dr {doctor.name}
                  </div>
                  <div style={{ fontSize: "var(--fs-sm)", color: "var(--accent)" }}>
                    {doctor.specialization}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "var(--sp-4)" }}>
                <Facts
                  items={[
                    { label: "Qualification", value: doctor.qualification },
                    { label: "Experience", value: `${doctor.experience} years`, mono: true },
                    { label: "Room", value: doctor.room, mono: true },
                    { label: "Days", value: [...days].join(", ") || "None selected" },
                    { label: "Slots", value: slots.size, mono: true },
                  ]}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "var(--sp-4)" }}>
            <Notice tone="info">
              Your name, qualification and room are set by the clinic office and
              cannot be edited here.
            </Notice>
          </div>
        </aside>
      </div>
    </div>
  );
}

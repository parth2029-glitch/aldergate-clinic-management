import { useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { List, X } from "@phosphor-icons/react";
import { useSession } from "../state/session";
import { CLINIC } from "../data/clinic";
import styles from "./Navbar.module.css";

export function Mark({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" aria-hidden="true">
      <rect width="26" height="26" rx="6" fill="var(--accent)" />
      <rect x="6.5" y="8" width="9" height="2" rx="1" fill="#fff" opacity="0.65" />
      <rect x="6.5" y="12" width="13" height="2" rx="1" fill="#fff" />
      <rect x="6.5" y="16" width="7" height="2" rx="1" fill="#fff" opacity="0.65" />
    </svg>
  );
}

const LINKS = {
  guest: [
    { to: "/doctors", label: "Find a doctor" },
    { to: "/about", label: "About" },
  ],
  patient: [
    { to: "/patient", label: "Overview", end: true },
    { to: "/doctors", label: "Find a doctor" },
    { to: "/patient/appointments", label: "Appointments" },
    { to: "/patient/profile", label: "Profile" },
  ],
  doctor: [
    { to: "/doctor", label: "Today", end: true },
    { to: "/doctor/appointments", label: "Schedule" },
    { to: "/doctor/patients", label: "Patients" },
    { to: "/doctor/profile", label: "Profile" },
  ],
  admin: [
    { to: "/admin", label: "Doctors", end: true },
    { to: "/admin/doctors/new", label: "Add a doctor" },
  ],
};

export default function Navbar() {
  const { role, user, logout } = useSession();
  const name = user?.name;
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const links = LINKS[role] ?? LINKS.guest;

  const home = role === "doctor" ? "/doctor" : role === "admin" ? "/admin" : "/";

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    setOpen(false);
  };

  return (
    <header className={styles.bar}>
      <div className={`shell ${styles.inner}`}>
        <Link to={home} className={styles.brand} onClick={() => setOpen(false)}>
          <Mark />
          <span className={styles.brandName}>{CLINIC.name}</span>
        </Link>

        <nav
          className={`${styles.nav} ${open ? styles.navOpen : ""}`}
          aria-label="Main"
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`
              }
            >
              {l.label}
            </NavLink>
          ))}

          {role !== "guest" && (
            <div className={styles.mobileOnly}>
              <button 
                className={styles.link}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'var(--red)' }}
                onClick={handleLogout}
              >
                Sign out
              </button>
            </div>
          )}
        </nav>

        <div className={styles.right}>
          {role === "guest" ? (
            <Link to="/login" className="btn btn--primary btn--sm">
              Sign in
            </Link>
          ) : (
            <>
              <span className={styles.who} title={`Signed in as ${name}`}>
                {name}
              </span>
              <button className={`${styles.desktopOnly} btn btn--ghost btn--sm`} onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}

          <button
            className={styles.burger}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={19} /> : <List size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}

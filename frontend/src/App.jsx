import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { CLINIC } from "./data/clinic";

import Home from "./components/Public/Home";
import About from "./components/Public/About";
import SignIn from "./components/Auth/SignIn";
import SignUp from "./components/Auth/SignUp";

import PatientDashboard from "./components/Patient/PatientDashboard";
import Doctors from "./components/Patient/Doctors";
import DoctorDetails from "./components/Patient/DoctorDetails";
import BookAppointment from "./components/Patient/BookAppointment";
import Appointments from "./components/Patient/Appointments";
import AppointmentDetails from "./components/Patient/AppointmentDetails";
import Profile from "./components/Patient/Profile";

import DoctorDashboard from "./components/Doctor/DoctorDashboard";
import DoctorAppointments from "./components/Doctor/DoctorAppointments";
import Patients from "./components/Doctor/Patients";
import PatientHistory from "./components/Doctor/PatientHistory";
import AddConsultation from "./components/Doctor/AddConsultation";
import DoctorProfile from "./components/Doctor/DoctorProfile";

import DoctorRoster from "./components/Admin/DoctorRoster";
import AddDoctor from "./components/Admin/AddDoctor";

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorDetails />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />

            <Route
              path="/patient"
              element={
                <PrivateRoute role="patient">
                  <PatientDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <PrivateRoute role="patient">
                  <Appointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/appointments/:id"
              element={
                <PrivateRoute role="patient">
                  <AppointmentDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/book/:doctorId"
              element={
                <PrivateRoute role="patient">
                  <BookAppointment />
                </PrivateRoute>
              }
            />
            <Route
              path="/patient/profile"
              element={
                <PrivateRoute role="patient">
                  <Profile />
                </PrivateRoute>
              }
            />

            <Route
              path="/doctor"
              element={
                <PrivateRoute role="doctor">
                  <DoctorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <PrivateRoute role="doctor">
                  <DoctorAppointments />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <PrivateRoute role="doctor">
                  <Patients />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/patients/:id"
              element={
                <PrivateRoute role="doctor">
                  <PatientHistory />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/patients/:id/consultation"
              element={
                <PrivateRoute role="doctor">
                  <AddConsultation />
                </PrivateRoute>
              }
            />
            <Route
              path="/doctor/profile"
              element={
                <PrivateRoute role="doctor">
                  <DoctorProfile />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <PrivateRoute role="admin">
                  <DoctorRoster />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/doctors/new"
              element={
                <PrivateRoute role="admin">
                  <AddDoctor />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

function NotFound() {
  return (
    <div className="shell page">
      <p className="section-label">404</p>
      <h1 style={{ marginTop: "var(--sp-3)" }}>That page isn&rsquo;t here</h1>
      <p className="lede" style={{ marginTop: "var(--sp-3)" }}>
        The link may be out of date, or the record may have been removed.
      </p>
      <Link to="/" className="btn btn--primary" style={{ marginTop: "var(--sp-5)" }}>
        Back to start
      </Link>
    </div>
  );
}

function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--line)",
        paddingBlock: "var(--sp-6)",
        marginTop: "var(--sp-8)",
      }}
    >
      <div
        className="shell"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--sp-4)",
          justifyContent: "space-between",
          fontSize: "var(--fs-sm)",
          color: "var(--ink-3)",
        }}
      >
        <span>
          {CLINIC.name} &middot; {CLINIC.line1}, {CLINIC.line2}
        </span>
        <span>
          Coursework project. All doctors, patients and records shown are invented.
        </span>
      </div>
    </footer>
  );
}

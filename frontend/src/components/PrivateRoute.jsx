import { Navigate, useLocation } from "react-router-dom";
import { useSession } from "../state/session";

/* Guards a branch of the route tree by role. Phase 2 keeps this component
   as-is and only changes where `useSession` gets its answer from — the
   backend stays the real enforcement point either way. */
export default function PrivateRoute({ role, children }) {
  const session = useSession();
  const location = useLocation();

  if (!session.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && session.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

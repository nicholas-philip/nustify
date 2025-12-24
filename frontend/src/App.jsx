import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import NotificationCenter from "../components/common/NotificationCenter";
import LandingPage from "../components/landing/LandingPage";
import LoginPage from "../components/auth/Loginpage";
import RegisterPage from "../components/auth/RegisterPage";
import PatientDashboard from "../components/patient/PatientDashboard";
import SearchNurses from "../components/patient/SearchNurses";
import NurseDetails from "../components/patient/NurseDetails";
import BookAppointment from "../components/patient/BookAppointment";
import PatientAppointments from "../components/patient/PatientAppointments";
import PatientProfile from "../components/patient/PatientProfile";
import SubmitReview from "../components/patient/SubmitReview";
import NurseDashboard from "../components/nurse/NurseDashboard";
import NurseProfile from "../components/nurse/NurseProfile";
import AdminDashboard from "../components/admin/AdminDashboard";
import AdminUsers from "../components/admin/AdminUsers";
import AdminAppointments from "../components/admin/adminAppointments";
import NurseAppointments from "../components/nurse/NurseAppointments";
import VerifyEmailPage from "../components/auth/VerifyEmailPage";
import EmailVerificationRequired from "../components/auth/EmailVerificationRequired";

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dashboardMap = {
      patient: "/patient/dashboard",
      nurse: "/nurse/dashboard",
      admin: "/admin/dashboard",
    };

    return <Navigate to={dashboardMap[user.role] || "/"} replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    const from = location.state?.from?.pathname;

    const dashboardMap = {
      patient: "/patient/dashboard",
      nurse: "/nurse/dashboard",
      admin: "/admin/dashboard",
    };

    if (from && from.startsWith(`/${user.role}/`)) {
      return <Navigate to={from} replace />;
    }

    return <Navigate to={dashboardMap[user.role] || "/"} replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route
            path="/email-verification-required"
            element={<EmailVerificationRequired />}
          />

          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/search"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <SearchNurses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/nurse/:id"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <NurseDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/book/:nurseId"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <BookAppointment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <PatientProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/review/:appointmentId"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <SubmitReview />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nurse/dashboard"
            element={
              <ProtectedRoute allowedRoles={["nurse"]}>
                <NurseDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/appointments"
            element={
              <ProtectedRoute allowedRoles={["nurse"]}>
                <NurseAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/profile"
            element={
              <ProtectedRoute allowedRoles={["nurse"]}>
                <NurseProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/appointments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

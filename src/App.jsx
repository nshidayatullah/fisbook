import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "./context/AuthContext";
import PageTransition from "./components/ui/PageTransition";

// Public Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Success from "./pages/Success";
import UnifiedLogin from "./pages/Login";

// Admin Pages
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Slots from "./pages/admin/Slots";
import Codes from "./pages/admin/Codes";
import Registrations from "./pages/admin/Registrations";
import Departments from "./pages/admin/Departments";
import Users from "./pages/admin/Users";
import DokterPatients from "./pages/admin/DokterPatients";
import DokterPatientDetail from "./pages/admin/DokterPatientDetail";
import DokterHistory from "./pages/admin/DokterHistory";

// Fisioterapis Pages
import FisioterapisLayout from "./pages/fisioterapis/FisioterapisLayout";
import FisioterApisDashboard from "./pages/fisioterapis/Dashboard";
import PatientDetail from "./pages/fisioterapis/PatientDetail";
import History from "./pages/fisioterapis/History";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
        <Route path="/success" element={<PageTransition><Success /></PageTransition>} />
        <Route path="/login" element={<PageTransition><UnifiedLogin /></PageTransition>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="slots" element={<Slots />} />
          <Route path="codes" element={<Codes />} />
          <Route path="registrations" element={<Registrations />} />
          <Route path="departments" element={<Departments />} />
          <Route path="users" element={<Users />} />
          <Route path="patients" element={<DokterPatients />} />
          <Route path="patient/:id" element={<DokterPatientDetail />} />
          <Route path="history" element={<DokterHistory />} />
        </Route>

        {/* Fisioterapis Routes */}
        <Route path="/fisioterapis/login" element={<Navigate to="/login" replace />} />
        <Route path="/fisioterapis" element={<FisioterapisLayout />}>
          <Route index element={<Navigate to="/fisioterapis/dashboard" replace />} />
          <Route path="dashboard" element={<FisioterApisDashboard />} />
          <Route path="history" element={<History />} />
          <Route path="patient/:id" element={<PatientDetail />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

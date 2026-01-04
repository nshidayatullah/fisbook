import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Public Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Success from "./pages/Success";
import UnifiedLogin from "./pages/Login";

// Admin Pages
import Login from "./pages/admin/Login";
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
import FisioterapisLogin from "./pages/fisioterapis/Login";
import FisioterapisLayout from "./pages/fisioterapis/FisioterapisLayout";
import FisioterApisDashboard from "./pages/fisioterapis/Dashboard";
import PatientDetail from "./pages/fisioterapis/PatientDetail";
import History from "./pages/fisioterapis/History";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />
          <Route path="/login" element={<UnifiedLogin />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
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
          <Route path="/fisioterapis/login" element={<FisioterapisLogin />} />
          <Route path="/fisioterapis" element={<FisioterapisLayout />}>
            <Route index element={<Navigate to="/fisioterapis/dashboard" replace />} />
            <Route path="dashboard" element={<FisioterApisDashboard />} />
            <Route path="history" element={<History />} />
            <Route path="patient/:id" element={<PatientDetail />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

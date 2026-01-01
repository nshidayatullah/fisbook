import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

// Public Pages
import Home from "./pages/Home";
import Register from "./pages/Register";
import Success from "./pages/Success";

// Admin Pages
import Login from "./pages/admin/Login";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Slots from "./pages/admin/Slots";
import Codes from "./pages/admin/Codes";
import Registrations from "./pages/admin/Registrations";
import Departments from "./pages/admin/Departments";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/success" element={<Success />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="slots" element={<Slots />} />
            <Route path="codes" element={<Codes />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="departments" element={<Departments />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

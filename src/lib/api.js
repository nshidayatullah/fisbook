import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Socket setup
export const socket = io(API_URL);

// Auth helpers
export const signIn = async (email, password) => {
  try {
    const { data } = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { data: data.user, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const signOut = async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return { error: null };
};

export const getCurrentUser = async () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    const { data } = await api.get('/api/auth/me');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Access Codes
export const validateAccessCode = async (code) => {
  try {
    const { data } = await api.post('/api/access-codes/validate', { code });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const markCodeAsUsed = async (id) => {
  try {
    const { data } = await api.patch(`/api/access-codes/${id}/use`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Slots
export const getSlotsGroupedByDate = async () => {
  try {
    const { data } = await api.get('/api/slots');
    // Group by date and map properties
    const grouped = data.reduce((acc, slot) => {
      const mappedSlot = {
        ...slot,
        is_booked: slot.isBooked
      };
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(mappedSlot);
      return acc;
    }, {});
    return { data: grouped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const bookSlot = async (id) => {
  try {
    const { data } = await api.patch(`/api/slots/${id}/book`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Departments
export const getDepartments = async () => {
  try {
    const { data } = await api.get('/api/departments');
    const mapped = data.map(d => ({
      ...d,
      is_active: d.isActive
    }));
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Helper for uniform registration data mapping
const mapRegistration = (reg) => {
  if (!reg) return null;
  return {
    ...reg,
    nama_lengkap: reg.namaLengkap,
    no_hp: reg.noHp,
    status_kunjungan: reg.statusKunjungan,
    tanggal_kunjungan: reg.tanggalKunjungan,
    pemeriksaan_fisik: reg.pemeriksaanFisik,
    tindakan_dilakukan: reg.tindakanDilakukan,
    rencana_tindakan: reg.rencanaTindakan,
    fisioterapis_id: reg.fisioterapisId,
    // Pluralize relations for frontend compatibility
    departments: reg.department,
    slots: reg.slot,
    access_codes: reg.accessCode
  };
};

// Registrations
export const createRegistration = async (registrationData) => {
  try {
    // registrationData is already formatted by the caller (Register.jsx)
    const { data } = await api.post('/api/registrations', registrationData);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const getPendingPatients = async () => {
  try {
    const { data } = await api.get('/api/registrations/pending');
    const mapped = (data || []).map(mapRegistration);
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const getPatientDetail = async (id) => {
  try {
    const { data } = await api.get(`/api/registrations/${id}`);
    const mapped = mapRegistration(data);
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const updateMedicalRecord = async (id, medicalData) => {
  try {
    const { data } = await api.patch(`/api/registrations/${id}/medical-record`, {
      anamnesa: medicalData.anamnesa,
      pemeriksaanFisik: medicalData.pemeriksaan_fisik,
      tindakanDilakukan: medicalData.tindakan_dilakukan,
      rencanaTindakan: medicalData.rencana_tindakan,
      fisioterapisId: medicalData.fisioterapis_id,
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const getDashboardStats = async () => {
  try {
    const { data } = await api.get('/api/dashboard/stats');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Users
export const getAllUsers = async () => {
  try {
    const { data } = await api.get('/api/users');
    // Map backend response (fullName -> full_name)
    const mapped = (data || []).map(u => ({
      ...u,
      full_name: u.fullName
    }));
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const createUser = async (email, password, role, fullName) => {
  try {
    const { data } = await api.post('/api/users', { email, password, role, fullName });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const updateUserProfile = async (id, profileData) => {
  try {
    const { data } = await api.patch(`/api/users/${id}`, {
      fullName: profileData.full_name,
      role: profileData.role
    });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const deleteUser = async (id) => {
  try {
    const { data } = await api.delete(`/api/users/${id}`);
    return { data, error: null };
  } catch (error) {
    return { error: error.response?.data || error };
  }
};

export const resetUserPassword = async (id, password) => {
  try {
    const { data } = await api.post(`/api/users/${id}/reset-password`, { password });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Access Codes
export const getAccessCodes = async () => {
  try {
    const { data } = await api.get('/api/access-codes');
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const generateAccessCodes = async (count) => {
  try {
    const { data } = await api.post('/api/access-codes/generate', { count });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const deleteAccessCode = async (id) => {
  try {
    const { data } = await api.delete(`/api/access-codes/${id}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Slots
export const generateSlots = async (date, hours) => {
  try {
    const { data } = await api.post('/api/slots/generate', { date, hours });
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const deleteSlot = async (id) => {
  try {
    const { data } = await api.delete(`/api/slots/${id}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Departments
export const createDepartment = async (deptData) => {
  try {
    // Map is_active to isActive for backend
    const payload = { 
      name: deptData.name, 
      isActive: deptData.is_active !== undefined ? deptData.is_active : true 
    };
    const { data } = await api.post('/api/departments', payload);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const updateDepartment = async (id, deptData) => {
  try {
    // Map is_active to isActive
    const payload = {};
    if (deptData.name !== undefined) payload.name = deptData.name;
    if (deptData.is_active !== undefined) payload.isActive = deptData.is_active;

    const { data } = await api.patch(`/api/departments/${id}`, payload);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const deleteDepartment = async (id) => {
  try {
    const { data } = await api.delete(`/api/departments/${id}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

// Registrations
export const getRegistrations = async () => {
  try {
    const { data } = await api.get('/api/registrations');
    const mapped = (data || []).map(mapRegistration);
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const getCompletedPatients = async () => {
  try {
    const { data } = await api.get('/api/registrations/completed');
    const mapped = (data || []).map(mapRegistration);
    return { data: mapped, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export const deleteRegistration = async (id) => {
  try {
    const { data } = await api.delete(`/api/registrations/${id}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error.response?.data || error };
  }
};

export default api;

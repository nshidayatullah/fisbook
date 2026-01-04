import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials. Please check your .env file.");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Auth helpers
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};

// Get user profile with role
export const getUserProfile = async (userId) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  return { data, error };
};

// User Management (Admin Only)
export const getAllUsers = async () => {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });

  return { data, error };
};

export const createUser = async (email, password, role, fullName) => {
  try {
    // Create user with email auto-confirm disabled (will need manual setup in Supabase)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
        emailRedirectTo: undefined, // Disable email confirmation redirect
      },
    });

    if (error) return { data: null, error };

    if (!data.user) {
      return { data: null, error: { message: "Failed to create user" } };
    }

    // Wait a bit for trigger to create profile
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Update profile with role and full_name
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role,
        full_name: fullName,
      })
      .eq("id", data.user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Don't return error, user is created, just profile update failed
    }

    return { data, error: null };
  } catch (err) {
    console.error("Create user error:", err);
    return { data: null, error: err };
  }
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();

  return { data, error };
};

export const deleteUser = async (userId) => {
  // Note: Deleting auth users requires admin privileges
  // For now, we'll just mark as inactive in profiles or delete profile
  const { error } = await supabase.from("profiles").delete().eq("id", userId);

  return { error };
};

export const sendPasswordResetEmail = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/`,
  });

  return { data, error };
};

// Access Codes
export const validateAccessCode = async (code) => {
  const { data, error } = await supabase.from("access_codes").select("*").eq("code", code).eq("is_used", false).single();

  return { data, error };
};

export const markCodeAsUsed = async (codeId) => {
  const { data, error } = await supabase.from("access_codes").update({ is_used: true }).eq("id", codeId).select().single();

  return { data, error };
};

export const generateAccessCodes = async (count) => {
  const { data, error } = await supabase.rpc("generate_access_codes", { count });

  return { data, error };
};

export const getAllAccessCodes = async () => {
  const { data, error } = await supabase
    .from("access_codes")
    .select(
      `
      *,
      registrations (
        id,
        nama_lengkap,
        nik,
        created_at
      )
    `
    )
    .order("created_at", { ascending: false });

  return { data, error };
};

export const deleteAccessCode = async (id) => {
  const { error } = await supabase.from("access_codes").delete().eq("id", id);

  return { error };
};

// Slots
export const getAvailableSlots = async (date = null) => {
  let query = supabase.from("slots").select("*").eq("is_booked", false).order("date", { ascending: true }).order("hour", { ascending: true });

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getAllSlots = async (startDate = null, endDate = null) => {
  let query = supabase.from("slots").select("*").order("date", { ascending: true }).order("hour", { ascending: true });

  if (startDate) {
    query = query.gte("date", startDate);
  }
  if (endDate) {
    query = query.lte("date", endDate);
  }

  const { data, error } = await query;
  return { data, error };
};

export const createSlots = async (date, hours) => {
  const slotsToInsert = hours.map((hour) => ({
    date,
    hour,
    is_booked: false,
  }));

  const { data, error } = await supabase.from("slots").upsert(slotsToInsert, { onConflict: "date,hour" }).select();

  return { data, error };
};

export const bookSlot = async (slotId) => {
  const { data, error } = await supabase.from("slots").update({ is_booked: true }).eq("id", slotId).select().single();

  return { data, error };
};

export const deleteSlot = async (id) => {
  const { error } = await supabase.from("slots").delete().eq("id", id);

  return { error };
};

// Departments
export const getDepartments = async () => {
  const { data, error } = await supabase.from("departments").select("*").eq("is_active", true).order("name", { ascending: true });

  return { data, error };
};

export const getAllDepartments = async () => {
  const { data, error } = await supabase.from("departments").select("*").order("name", { ascending: true });

  return { data, error };
};

export const createDepartment = async (name) => {
  const { data, error } = await supabase.from("departments").insert({ name, is_active: true }).select().single();

  return { data, error };
};

export const updateDepartment = async (id, updates) => {
  const { data, error } = await supabase.from("departments").update(updates).eq("id", id).select().single();

  return { data, error };
};

export const deleteDepartment = async (id) => {
  const { error } = await supabase.from("departments").delete().eq("id", id);

  return { error };
};

// Registrations
export const createRegistration = async (registrationData) => {
  const { data, error } = await supabase
    .from("registrations")
    .insert(registrationData)
    .select(
      `
      *,
      slots (date, hour),
      departments (name),
      access_codes (code)
    `
    )
    .single();

  return { data, error };
};

export const getAllRegistrations = async () => {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      slots (date, hour),
      departments (name),
      access_codes (code)
    `
    )
    .order("created_at", { ascending: false });

  return { data, error };
};

export const deleteRegistration = async (id) => {
  const { error } = await supabase.from("registrations").delete().eq("id", id);

  return { error };
};

// Fisioterapis Functions
export const getPendingPatients = async () => {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      slots (date, hour),
      departments (name),
      access_codes (code)
    `
    )
    .eq("status_kunjungan", "pending")
    .order("created_at", { ascending: false });

  return { data, error };
};

export const getCompletedPatients = async () => {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      slots (date, hour),
      departments (name),
      access_codes (code)
    `
    )
    .eq("status_kunjungan", "selesai")
    .order("tanggal_kunjungan", { ascending: false });

  return { data, error };
};

export const getPatientDetail = async (id) => {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      `
      *,
      slots (date, hour),
      departments (name),
      access_codes (code)
    `
    )
    .eq("id", id)
    .single();

  return { data, error };
};

export const updateMedicalRecord = async (id, medicalData) => {
  const { data, error } = await supabase
    .from("registrations")
    .update({
      anamnesa: medicalData.anamnesa,
      pemeriksaan_fisik: medicalData.pemeriksaan_fisik,
      tindakan_dilakukan: medicalData.tindakan_dilakukan,
      rencana_tindakan: medicalData.rencana_tindakan,
      status_kunjungan: "selesai",
      tanggal_kunjungan: medicalData.tanggal_kunjungan || new Date().toISOString(),
      fisioterapis_id: medicalData.fisioterapis_id,
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
};

// Dashboard Stats
// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    const [registrations, slots, codes, departments] = await Promise.all([
      supabase.from("registrations").select("id", { count: "exact", head: true }),
      supabase.from("slots").select("id", { count: "exact", head: true }).eq("is_booked", false),
      supabase.from("access_codes").select("id", { count: "exact", head: true }).eq("is_used", false),
      supabase.from("departments").select("id", { count: "exact", head: true }),
    ]);

    return {
      data: {
        total_registrations: registrations.count || 0,
        available_slots: slots.count || 0,
        available_codes: codes.count || 0,
        total_departments: departments.count || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { data: null, error };
  }
};

// Get slots grouped by date for display
export const getSlotsGroupedByDate = async () => {
  const { data, error } = await supabase.from("slots").select("*").gte("date", new Date().toISOString().split("T")[0]).order("date", { ascending: true }).order("hour", { ascending: true });

  if (error) return { data: null, error };

  // Group by date
  const grouped = data.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return { data: grouped, error: null };
};

// Aliases for convenience
export const getAccessCodes = getAllAccessCodes;
export const getRegistrations = getAllRegistrations;
export const generateSlots = createSlots;

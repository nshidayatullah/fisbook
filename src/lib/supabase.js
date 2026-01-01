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
  const { data, error } = await supabase.from("access_codes").select("*").order("created_at", { ascending: false });

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

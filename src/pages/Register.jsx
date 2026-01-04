import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getSlotsGroupedByDate, getDepartments, createRegistration, markCodeAsUsed, bookSlot } from "../lib/supabase";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accessCode, setAccessCode] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    nama_lengkap: "",
    nik: "",
    no_hp: "",
    department_id: "",
    keluhan: "",
  });
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [errors, setErrors] = useState({});

  // Data from API
  const [departments, setDepartments] = useState([]);
  const [slotsGrouped, setSlotsGrouped] = useState({});
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const storedCode = sessionStorage.getItem("accessCode");
    if (!storedCode) {
      navigate("/");
      return;
    }

    try {
      const parsedCode = JSON.parse(storedCode);
      if (parsedCode.is_used) {
        sessionStorage.removeItem("accessCode");
        navigate("/");
        return;
      }
      setAccessCode(parsedCode);
    } catch {
      navigate("/");
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [deptResult, slotsResult] = await Promise.all([getDepartments(), getSlotsGroupedByDate()]);

      if (deptResult.data) {
        setDepartments(deptResult.data);
      }

      if (slotsResult.data) {
        setSlotsGrouped(slotsResult.data);
        const dates = Object.keys(slotsResult.data);
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
    } catch {
      setError("Gagal memuat data. Silakan refresh halaman.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "nama_lengkap" ? value.toUpperCase() : value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = "Nama lengkap wajib diisi";
    }

    if (!formData.nik.trim()) {
      newErrors.nik = "NIK karyawan wajib diisi";
    }

    if (!formData.no_hp.trim()) {
      newErrors.no_hp = "No. HP wajib diisi";
    } else if (!/^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(formData.no_hp.replace(/\s/g, ""))) {
      newErrors.no_hp = "Format No. HP tidak valid";
    }

    if (!formData.department_id) {
      newErrors.department_id = "Departemen wajib dipilih";
    }

    if (!formData.keluhan.trim()) {
      newErrors.keluhan = "Keluhan wajib diisi";
    }

    if (!selectedSlot) {
      newErrors.slot = "Pilih slot jadwal";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    setError("");

    try {
      const { error: slotError } = await bookSlot(selectedSlot.id);
      if (slotError) {
        if (slotError.message.includes("constraint")) {
          setError("Slot sudah dipesan orang lain. Silakan pilih slot lain.");
          loadData();
        } else {
          setError("Gagal memesan slot. Silakan coba lagi.");
        }
        setSubmitting(false);
        return;
      }

      const { error: codeError } = await markCodeAsUsed(accessCode.id);
      if (codeError) {
        setError("Gagal memproses kode akses.");
        setSubmitting(false);
        return;
      }

      const registrationData = {
        access_code_id: accessCode.id,
        slot_id: selectedSlot.id,
        department_id: formData.department_id,
        nama_lengkap: formData.nama_lengkap.toUpperCase(),
        nik: formData.nik,
        no_hp: formData.no_hp,
        keluhan: formData.keluhan,
      };

      const { data: registration, error: regError } = await createRegistration(registrationData);

      if (regError) {
        setError("Gagal menyimpan pendaftaran.");
        setSubmitting(false);
        return;
      }

      sessionStorage.removeItem("accessCode");
      sessionStorage.setItem("registration", JSON.stringify(registration));
      navigate("/success");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatHour = (hour) => {
    return `${String(hour).padStart(2, "0")}:00 - ${String(hour + 1).padStart(2, "0")}:00`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-indigo-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  const availableDates = Object.keys(slotsGrouped);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto max-w-lg px-4 py-4 flex items-center">
          <button
            onClick={() => {
              sessionStorage.removeItem("accessCode");
              navigate("/");
            }}
            className="rounded-lg p-2 -ml-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">Form Pendaftaran</h1>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6 pb-28">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Access Code Display */}
          <div className="rounded-xl bg-indigo-50 p-4 flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
              <svg className="h-6 w-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-600">Kode Akses Anda</p>
              <p className="text-2xl font-bold tracking-[0.3em] text-indigo-900">{accessCode?.code}</p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="rounded-2xl bg-white p-6 shadow-sm outline outline-1 -outline-offset-1 outline-gray-200">
            <h2 className="text-base font-semibold text-gray-900 mb-6">Data Diri</h2>
            <div className="space-y-5">
              {/* Nama Lengkap */}
              <div>
                <label htmlFor="nama_lengkap" className="block text-sm/6 font-medium text-gray-900">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                      errors.nama_lengkap ? "outline-red-300" : "outline-gray-300"
                    }`}
                  />
                </div>
                {errors.nama_lengkap && <p className="mt-2 text-sm text-red-600">{errors.nama_lengkap}</p>}
              </div>

              {/* NIK */}
              <div>
                <label htmlFor="nik" className="block text-sm/6 font-medium text-gray-900">
                  NIK Karyawan <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="nik"
                    name="nik"
                    type="text"
                    placeholder="Masukkan NIK"
                    value={formData.nik}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                      errors.nik ? "outline-red-300" : "outline-gray-300"
                    }`}
                  />
                </div>
                {errors.nik && <p className="mt-2 text-sm text-red-600">{errors.nik}</p>}
              </div>

              {/* No HP */}
              <div>
                <label htmlFor="no_hp" className="block text-sm/6 font-medium text-gray-900">
                  No. HP <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    id="no_hp"
                    name="no_hp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={formData.no_hp}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                      errors.no_hp ? "outline-red-300" : "outline-gray-300"
                    }`}
                  />
                </div>
                {errors.no_hp && <p className="mt-2 text-sm text-red-600">{errors.no_hp}</p>}
              </div>

              {/* Departemen */}
              <div>
                <label htmlFor="department_id" className="block text-sm/6 font-medium text-gray-900">
                  Departemen <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                      errors.department_id ? "outline-red-300" : "outline-gray-300"
                    }`}
                  >
                    <option value="">Pilih departemen</option>
                    {departments
                      .filter((d) => d.name && typeof d.name === "string" && !d.name.startsWith("{"))
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                  </select>
                </div>
                {errors.department_id && <p className="mt-2 text-sm text-red-600">{errors.department_id}</p>}
              </div>

              {/* Keluhan */}
              <div>
                <label htmlFor="keluhan" className="block text-sm/6 font-medium text-gray-900">
                  Keluhan <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <textarea
                    id="keluhan"
                    name="keluhan"
                    rows={3}
                    placeholder="Jelaskan keluhan Anda..."
                    value={formData.keluhan}
                    onChange={handleInputChange}
                    className={`block w-full rounded-lg bg-white px-4 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 ${
                      errors.keluhan ? "outline-red-300" : "outline-gray-300"
                    }`}
                  />
                </div>
                {errors.keluhan && <p className="mt-2 text-sm text-red-600">{errors.keluhan}</p>}
              </div>
            </div>
          </div>

          {/* Slot Selection */}
          <div className="rounded-2xl bg-white p-6 shadow-sm outline outline-1 -outline-offset-1 outline-gray-200">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-gray-900">Pilih Jadwal</h2>
              {errors.slot && <p className="mt-1 text-sm text-red-600">{errors.slot}</p>}
            </div>

            {availableDates.length === 0 ? (
              <div className="py-12 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-3 text-sm text-gray-500">Tidak ada slot tersedia</p>
                <p className="text-sm text-gray-400">Silakan hubungi admin</p>
              </div>
            ) : (
              <>
                {/* Date Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2">
                  {availableDates.map((date) => (
                    <button
                      key={date}
                      type="button"
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedSlot(null);
                      }}
                      className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${selectedDate === date ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    >
                      {new Date(date).toLocaleDateString("id-ID", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </button>
                  ))}
                </div>

                {/* Selected Date Label */}
                <p className="mb-4 text-sm font-medium text-gray-600">📅 {formatDate(selectedDate)}</p>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {slotsGrouped[selectedDate]
                    ?.filter((slot) => !slot.is_booked)
                    .map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedSlot(slot);
                          setErrors((prev) => ({ ...prev, slot: "" }));
                        }}
                        className={`rounded-xl p-4 text-left outline outline-2 -outline-offset-2 transition-all ${selectedSlot?.id === slot.id ? "bg-indigo-50 outline-indigo-600" : "bg-white outline-gray-200 hover:outline-gray-300"}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${selectedSlot?.id === slot.id ? "bg-indigo-600" : "bg-emerald-500"}`} />
                          <span className="font-semibold text-gray-900">{formatHour(slot.hour)}</span>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Booked Slots */}
                {slotsGrouped[selectedDate]?.some((s) => s.is_booked) && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="mb-3 text-xs font-medium text-gray-400">Slot tidak tersedia:</p>
                    <div className="flex flex-wrap gap-2">
                      {slotsGrouped[selectedDate]
                        ?.filter((slot) => slot.is_booked)
                        .map((slot) => (
                          <span key={slot.id} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-400 line-through">
                            {formatHour(slot.hour)}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Selected Summary */}
          {selectedSlot && (
            <div className="rounded-2xl bg-emerald-50 p-5 outline outline-1 -outline-offset-1 outline-emerald-200">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                  <svg className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Jadwal Dipilih</p>
                  <p className="mt-1 font-semibold text-emerald-900">{formatDate(selectedSlot.date)}</p>
                  <p className="text-emerald-700">{formatHour(selectedSlot.hour)}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      {/* Fixed Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm p-4">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !selectedSlot}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {submitting ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Memproses...
              </>
            ) : (
              "Daftar Sekarang"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;

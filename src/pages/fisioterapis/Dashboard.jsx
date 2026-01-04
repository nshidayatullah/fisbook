import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UsersIcon, CalendarIcon, PhoneIcon, UserIcon, ChevronRightIcon, KeyIcon } from "@heroicons/react/24/outline";
import { getPendingPatients } from "../../lib/supabase";

const FisioterApisDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data, error: fetchError } = await getPendingPatients();

      if (fetchError) throw fetchError;

      setPatients(data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pasien");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatHour = (hour) => {
    return `${String(hour).padStart(2, "0")}:00`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-3 text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white shadow-lg shadow-emerald-500/20 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Antrian Pasien</h2>
            <p className="mt-1 text-emerald-100">Pasien yang menunggu untuk dilayani</p>
          </div>
          <div className="hidden sm:block">
            <UsersIcon className="h-16 w-16 text-emerald-300/30" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
        <p className="text-sm font-medium text-gray-400">Total Pasien Menunggu</p>
        <p className="mt-1 text-3xl font-bold text-white">{patients.length}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Patient List */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar Pasien</h3>
        </div>

        {patients.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">Tidak ada pasien dalam antrian</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {patients.map((patient) => (
              <Link key={patient.id} to={`/fisioterapis/patient/${patient.id}`} className="block p-6 hover:bg-white/5 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-lg font-bold text-emerald-400 shadow-inner shadow-emerald-500/10 ring-1 ring-inset ring-emerald-500/30">
                      {patient.nama_lengkap?.charAt(0) || "?"}
                    </div>

                    {/* Patient Info */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors">{patient.nama_lengkap}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          {patient.nik}
                        </span>
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4 text-gray-500" />
                          {patient.no_hp}
                        </span>
                        <span className="flex items-center gap-1">
                          <KeyIcon className="h-4 w-4 text-gray-500" />
                          Kode: {patient.access_codes?.code || "-"}
                        </span>
                      </div>
                      <p className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 border border-white/5">{patient.departments?.name}</p>

                      {/* Keluhan */}
                      {patient.keluhan && (
                        <div className="mt-3 rounded-lg bg-gray-900/40 p-3 border border-white/5">
                          <p className="text-xs font-medium text-gray-500 mb-1">Keluhan:</p>
                          <p className="text-sm text-gray-300 line-clamp-2">{patient.keluhan}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule & Arrow */}
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 border border-emerald-500/20">
                      <CalendarIcon className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-200">{formatDate(patient.slots?.date)}</p>
                        <p className="text-sm text-emerald-400">{formatHour(patient.slots?.hour)}</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-6 w-6 text-gray-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>

                {/* Mobile Schedule */}
                <div className="mt-4 sm:hidden flex items-center gap-3 rounded-xl bg-emerald-500/10 px-4 py-3 border border-emerald-500/20">
                  <CalendarIcon className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-200">{formatDate(patient.slots?.date)}</p>
                    <p className="text-sm text-emerald-400">{formatHour(patient.slots?.hour)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FisioterApisDashboard;

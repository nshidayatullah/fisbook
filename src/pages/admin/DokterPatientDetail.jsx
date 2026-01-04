import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, UserIcon, PhoneIcon, CalendarIcon, ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { getPatientDetail } from "../../lib/supabase";

const DokterPatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPatientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPatientData = async () => {
    try {
      const { data, error: fetchError } = await getPatientDetail(id);

      if (fetchError) throw fetchError;

      setPatient(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pasien");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatHour = (hour) => {
    if (!hour) return "-";
    return `${String(hour).padStart(2, "0")}:00`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-blue-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-3 text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
          Kembali
        </button>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error || "Pasien tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  const isCompleted = patient.status_kunjungan === "selesai";

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeftIcon className="h-5 w-5" />
        Kembali
      </button>

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/20 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold">{patient.nama_lengkap?.charAt(0) || "?"}</div>
          <div>
            <h2 className="text-2xl font-bold">{patient.nama_lengkap}</h2>
            <p className="mt-1 text-blue-100">Detail Rekam Medis Pasien</p>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Informasi Pasien</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <UserIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">NIK</p>
                <p className="text-sm font-medium text-white">{patient.nik}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PhoneIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">No. HP</p>
                <p className="text-sm font-medium text-white">{patient.no_hp}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClipboardDocumentListIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Departemen</p>
                <p className="text-sm font-medium text-white">{patient.departments?.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Jadwal Kunjungan</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Tanggal</p>
                <p className="text-sm font-medium text-white">{formatDate(patient.slots?.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 claimw-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Jam</p>
                <p className="text-sm font-medium text-white">{formatHour(patient.slots?.hour)}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">Selesai</span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400 border border-yellow-500/20">Menunggu</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Keluhan */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Keluhan</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{patient.keluhan || "-"}</p>
      </div>

      {/* Medical Records - Read Only */}
      {isCompleted && (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Rekam Medis</h3>

          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Anamnesa</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{patient.anamnesa || "-"}</p>
          </div>

          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Pemeriksaan Fisik</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{patient.pemeriksaan_fisik || "-"}</p>
          </div>

          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Tindakan yang Dilakukan</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{patient.tindakan_dilakukan || "-"}</p>
          </div>

          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Rencana Tindakan Selanjutnya</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{patient.rencana_tindakan || "-"}</p>
          </div>
        </div>
      )}

      {!isCompleted && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-400">📝 Pasien ini belum dilayani. Rekam medis akan tersedia setelah fisioterapis menyelesaikan pelayanan.</p>
        </div>
      )}
    </div>
  );
};

export default DokterPatientDetail;

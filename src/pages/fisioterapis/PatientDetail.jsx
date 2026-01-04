import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckIcon } from "@heroicons/react/24/outline";
import { getPatientDetail, updateMedicalRecord, getCurrentUser } from "../../lib/supabase";

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    anamnesa: "",
    pemeriksaan_fisik: "",
    tindakan_dilakukan: "",
    rencana_tindakan: "",
  });

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      const { data, error: fetchError } = await getPatientDetail(id);

      if (fetchError) throw fetchError;

      setPatient(data);

      // If already completed, pre-fill form
      if (data.status_kunjungan === "selesai") {
        setFormData({
          anamnesa: data.anamnesa || "",
          pemeriksaan_fisik: data.pemeriksaan_fisik || "",
          tindakan_dilakukan: data.tindakan_dilakukan || "",
          rencana_tindakan: data.rencana_tindakan || "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data pasien");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.anamnesa || !formData.pemeriksaan_fisik || !formData.tindakan_dilakukan || !formData.rencana_tindakan) {
      setError("Semua field harus diisi");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const user = await getCurrentUser();

      const medicalData = {
        ...formData,
        fisioterapis_id: user.id,
        tanggal_kunjungan: new Date().toISOString(),
      };

      const { error: updateError } = await updateMedicalRecord(id, medicalData);

      if (updateError) throw updateError;

      setSuccess("Rekam medis berhasil disimpan");

      setTimeout(() => {
        navigate("/fisioterapis/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan rekam medis");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
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

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Pasien tidak ditemukan</p>
      </div>
    );
  }

  const isCompleted = patient.status_kunjungan === "selesai";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/fisioterapis/dashboard")} className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Rekam Medis Pasien</h1>
          <p className="text-gray-400">{isCompleted ? "Lihat rekam medis pasien" : "Input hasil pemeriksaan dan tindakan"}</p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckIcon className="h-5 w-5" />
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      {/* Patient Info */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Data Pasien</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Nama Lengkap</p>
            <p className="text-white font-medium mt-1">{patient.nama_lengkap}</p>
          </div>
          <div>
            <p className="text-gray-500">NIK</p>
            <p className="text-white font-medium mt-1">{patient.nik}</p>
          </div>
          <div>
            <p className="text-gray-500">No. HP</p>
            <p className="text-white font-medium mt-1">{patient.no_hp}</p>
          </div>
          <div>
            <p className="text-gray-500">Departemen</p>
            <p className="text-white font-medium mt-1">{patient.departments?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Jadwal Kunjungan</p>
            <p className="text-white font-medium mt-1">
              {formatDate(patient.slots?.date)}, {formatHour(patient.slots?.hour)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Keluhan</p>
            <p className="text-white font-medium mt-1">{patient.keluhan}</p>
          </div>
        </div>
      </div>

      {/* Medical Record Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-6">Rekam Medis</h3>
          <div className="space-y-6">
            {/* Anamnesa */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Anamnesa <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.anamnesa}
                onChange={(e) => setFormData({ ...formData, anamnesa: e.target.value })}
                disabled={isCompleted}
                className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Riwayat keluhan, onset, durasi, faktor pemberat/peringan, dll..."
              />
            </div>

            {/* Pemeriksaan Fisik */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Pemeriksaan Fisik <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.pemeriksaan_fisik}
                onChange={(e) => setFormData({ ...formData, pemeriksaan_fisik: e.target.value })}
                disabled={isCompleted}
                className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Inspeksi, palpasi, ROM, MMT, special test, dll..."
              />
            </div>

            {/* Tindakan Dilakukan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tindakan yang Dilakukan <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.tindakan_dilakukan}
                onChange={(e) => setFormData({ ...formData, tindakan_dilakukan: e.target.value })}
                disabled={isCompleted}
                className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Modalitas, terapi manual, exercise, edukasi, dll..."
              />
            </div>

            {/* Rencana Tindakan */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rencana Tindakan Selanjutnya <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.rencana_tindakan}
                onChange={(e) => setFormData({ ...formData, rencana_tindakan: e.target.value })}
                disabled={isCompleted}
                className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Rencana terapi selanjutnya, target, frekuensi kunjungan, dll..."
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {!isCompleted && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:shadow-emerald-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </div>
              ) : (
                <>
                  <CheckIcon className="inline h-5 w-5 mr-2" />
                  Simpan & Selesaikan Kunjungan
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PatientDetail;

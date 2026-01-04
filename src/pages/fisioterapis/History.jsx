import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon, CalendarIcon, PhoneIcon, UserIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getCompletedPatients, deleteRegistration } from "../../lib/supabase";
import ConfirmModal from "../../components/ui/ConfirmModal";

const History = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, patientId: null, patientName: "" });

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      const { data, error: fetchError } = await getCompletedPatients();

      if (fetchError) throw fetchError;

      setPatients(data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data riwayat");
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (e, patient) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setDeleteModal({
      open: true,
      patientId: patient.id,
      patientName: patient.nama_lengkap,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, patientId: null, patientName: "" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.patientId) return;

    const previousPatients = [...patients];
    const idToDelete = deleteModal.patientId;

    setPatients((prev) => prev.filter((p) => p.id !== idToDelete));
    closeDeleteModal();
    setSuccess("Riwayat pasien berhasil dihapus");

    try {
      const { error } = await deleteRegistration(idToDelete);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setPatients(previousPatients);
      setError("Gagal menghapus riwayat pasien");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Riwayat Pasien"
        message={`Apakah Anda yakin ingin menghapus riwayat pasien "${deleteModal.patientName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white shadow-lg shadow-blue-500/20 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Riwayat Pelayanan</h2>
            <p className="mt-1 text-blue-100">Pasien yang telah dilayani</p>
          </div>
          <div className="hidden sm:block">
            <CheckCircleIcon className="h-16 w-16 text-blue-300/30" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
        <p className="text-sm font-medium text-gray-400">Total Pasien Dilayani</p>
        <p className="mt-1 text-3xl font-bold text-white">{patients.length}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex text-red-400">
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError("")} className="ml-auto hover:text-red-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex text-emerald-400">
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <p className="ml-3 text-sm flex-1">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Patient List */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar Riwayat</h3>
        </div>

        {patients.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">Belum ada riwayat pelayanan</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {patients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-colors group">
                <Link to={`/fisioterapis/patient/${patient.id}`} className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-lg font-bold text-blue-400 shadow-inner shadow-blue-500/10 ring-1 ring-inset ring-blue-500/30">
                    {patient.nama_lengkap?.charAt(0) || "?"}
                  </div>

                  {/* Patient Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">{patient.nama_lengkap}</h4>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                        <CheckCircleIcon className="h-3 w-3" />
                        Selesai
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        {patient.nik}
                      </span>
                      <span className="flex items-center gap-1">
                        <PhoneIcon className="h-4 w-4 text-gray-500" />
                        {patient.no_hp}
                      </span>
                    </div>
                    <p className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 border border-white/5">{patient.departments?.name}</p>

                    {/* Visit Date */}
                    <p className="mt-2 text-xs text-gray-500">
                      Tanggal Kunjungan: <span className="text-gray-400">{formatDateTime(patient.tanggal_kunjungan)}</span>
                    </p>
                  </div>
                </Link>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  <Link to={`/fisioterapis/patient/${patient.id}`}>
                    <button className="rounded-lg p-2 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400 transition-colors" title="Lihat detail">
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </Link>
                  <button onClick={(e) => openDeleteModal(e, patient)} className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Hapus riwayat">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

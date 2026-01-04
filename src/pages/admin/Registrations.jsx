import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, ClipboardDocumentListIcon, CalendarIcon, PhoneIcon, UserIcon, TrashIcon } from "@heroicons/react/24/outline";
import { getRegistrations, deleteRegistration } from "../../lib/supabase";
import ConfirmModal from "../../components/ui/ConfirmModal";

const Registrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, regId: null, regName: "" });
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    try {
      const { data, error } = await getRegistrations();
      if (error) throw error;
      setRegistrations(data || []);
    } catch {
      setError("Gagal memuat data pendaftaran");
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return reg.nama_lengkap?.toLowerCase().includes(query) || reg.nik?.toLowerCase().includes(query) || reg.no_hp?.includes(query) || reg.departments?.name?.toLowerCase().includes(query);
  });

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

  const openDeleteModal = (reg) => {
    setDeleteModal({ open: true, regId: reg.id, regName: reg.nama_lengkap });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, regId: null, regName: "" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.regId) return;

    // Optimistic update
    const previousRegistrations = [...registrations];
    const idToDelete = deleteModal.regId;

    setRegistrations((prev) => prev.filter((r) => r.id !== idToDelete));
    closeDeleteModal();
    setSuccess("Pendaftaran berhasil dihapus");

    try {
      const { error } = await deleteRegistration(idToDelete);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setRegistrations(previousRegistrations);
      setError("Gagal menghapus pendaftaran");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24">
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
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Pendaftaran"
        message={`Apakah Anda yakin ingin menghapus pendaftaran atas nama "${deleteModal.regName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex text-red-400">
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm">{error}</p>
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
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
            </svg>
            <p className="ml-3 text-sm">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
          <p className="text-sm font-medium text-gray-400">Total Pendaftaran</p>
          <p className="mt-1 text-2xl font-bold text-white">{registrations.length}</p>
        </div>
        <div className="rounded-2xl bg-blue-500/10 backdrop-blur-md p-5 border border-blue-500/20">
          <p className="text-sm font-medium text-blue-400">Hari Ini</p>
          <p className="mt-1 text-2xl font-bold text-blue-500">
            {
              registrations.filter((r) => {
                const today = new Date().toISOString().split("T")[0];
                return r.slots?.date === today;
              }).length
            }
          </p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 backdrop-blur-md p-5 border border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-400">Minggu Ini</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">
            {
              registrations.filter((r) => {
                const now = new Date();
                const slotDate = new Date(r.slots?.date);
                const diffTime = slotDate.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
              }).length
            }
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <div className="relative">
          <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, NIK, atau departemen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-lg bg-white/5 py-3 pl-12 pr-4 text-base text-white border border-white/10 placeholder:text-gray-500 focus:border-indigo-500 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Registrations List */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar Pendaftaran ({filteredRegistrations.length})</h3>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">{searchQuery ? "Tidak ditemukan hasil pencarian" : "Belum ada pendaftaran"}</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredRegistrations.map((reg) => (
              <div key={reg.id} className="p-6 hover:bg-white/5 transition-colors">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left: Person info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-bold text-indigo-400 shadow-inner shadow-indigo-500/10 ring-1 ring-inset ring-indigo-500/30">
                      {reg.nama_lengkap?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-semibold text-white">{reg.nama_lengkap}</h4>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4 text-gray-500" />
                          {reg.nik}
                        </span>
                        <span className="flex items-center gap-1">
                          <PhoneIcon className="h-4 w-4 text-gray-500" />
                          {reg.no_hp}
                        </span>
                      </div>
                      <p className="mt-2 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 border border-white/5">{reg.departments?.name}</p>
                    </div>
                  </div>

                  {/* Right: Schedule and Actions */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 rounded-xl bg-indigo-500/10 px-4 py-3 border border-indigo-500/20 sm:min-w-[180px]">
                      <CalendarIcon className="h-5 w-5 text-indigo-400" />
                      <div>
                        <p className="text-sm font-semibold text-indigo-200">{formatDate(reg.slots?.date)}</p>
                        <p className="text-sm text-indigo-400">{formatHour(reg.slots?.hour)}</p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button onClick={() => openDeleteModal(reg)} className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Hapus pendaftaran">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Complaint */}
                {reg.keluhan && (
                  <div className="mt-4 rounded-lg bg-gray-900/40 p-3 border border-white/5">
                    <p className="text-xs font-medium text-gray-500 mb-1">Keluhan:</p>
                    <p className="text-sm text-gray-300">{reg.keluhan}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registrations;

import { useState, useEffect } from "react";
import { KeyIcon, ClipboardIcon, TrashIcon, CheckIcon, FunnelIcon } from "@heroicons/react/24/outline";
import { getAccessCodes, generateAccessCodes, deleteAccessCode } from "../../lib/supabase";
import ConfirmModal from "../../components/ui/ConfirmModal";

const Codes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all"); // all, unused, used
  const [generateCount, setGenerateCount] = useState(5);
  const [copiedId, setCopiedId] = useState(null);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, codeId: null });
  const [deleting] = useState(false);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    try {
      const { data, error } = await getAccessCodes();
      if (error) throw error;
      setCodes(data || []);
    } catch {
      setError("Gagal memuat data kode akses");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await generateAccessCodes(generateCount);
      if (error) throw error;

      setSuccess(`Berhasil membuat ${data?.length || generateCount} kode akses baru`);
      loadCodes();
    } catch {
      setError("Gagal membuat kode akses");
    } finally {
      setGenerating(false);
    }
  };

  const openDeleteModal = (codeId) => {
    setDeleteModal({ open: true, codeId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, codeId: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.codeId) return;

    // Simpan state lama
    const previousCodes = [...codes];
    const idToDelete = deleteModal.codeId;

    // 1. Optimistic Update: Hapus lokal
    setCodes((prev) => prev.filter((c) => c.id !== idToDelete));
    closeDeleteModal();
    setSuccess("Kode akses berhasil dihapus");

    try {
      const { error } = await deleteAccessCode(idToDelete);
      if (error) throw error;
    } catch {
      // Rollback
      setCodes(previousCodes);
      setError("Gagal menghapus kode");
    }
  };

  const copyToClipboard = async (code, id) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Gagal menyalin kode");
    }
  };

  const filteredCodes = codes.filter((code) => {
    if (filter === "unused") return !code.is_used;
    if (filter === "used") return code.is_used;
    return true;
  });

  const unusedCount = codes.filter((c) => !c.is_used).length;
  const usedCount = codes.filter((c) => c.is_used).length;

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
    <div className="space-y-8">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Kode Akses"
        message="Apakah Anda yakin ingin menghapus kode akses ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        loading={deleting}
      />

      {/* Alerts */}
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

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex text-emerald-400">
            <CheckIcon className="h-5 w-5" />
            <p className="ml-3 text-sm">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
          <p className="text-sm font-medium text-gray-400">Total Kode</p>
          <p className="mt-1 text-2xl font-bold text-white">{codes.length}</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 backdrop-blur-md p-5 border border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-400">Tersedia</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">{unusedCount}</p>
        </div>
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5">
          <p className="text-sm font-medium text-gray-400">Terpakai</p>
          <p className="mt-1 text-2xl font-bold text-gray-300">{usedCount}</p>
        </div>
      </div>

      {/* Generate Form */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-white">Generate Kode Akses</h3>
        <p className="mt-1 text-sm text-gray-400">Buat kode akses baru untuk karyawan</p>

        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="count" className="block text-sm font-medium text-gray-300">
              Jumlah Kode
            </label>
            <select
              id="count"
              value={generateCount}
              onChange={(e) => setGenerateCount(Number(e.target.value))}
              className="mt-2 block rounded-lg bg-white/5 px-4 py-3 text-base text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {[1, 5, 10, 20, 50].map((n) => (
                <option key={n} value={n} className="bg-gray-800 text-white">
                  {n} kode
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Membuat...
              </>
            ) : (
              <>
                <KeyIcon className="h-5 w-5" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Codes List */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar Kode</h3>
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border-0 bg-white/5 py-2 pl-3 pr-8 text-sm font-medium text-white ring-1 ring-white/10 focus:ring-2 focus:ring-indigo-500">
              <option value="all" className="bg-gray-800">
                Semua ({codes.length})
              </option>
              <option value="unused" className="bg-gray-800">
                Tersedia ({unusedCount})
              </option>
              <option value="used" className="bg-gray-800">
                Terpakai ({usedCount})
              </option>
            </select>
          </div>
        </div>

        {filteredCodes.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">Tidak ada kode</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCodes.map((code) => (
              <div
                key={code.id}
                className={`group relative rounded-xl p-4 border transition-all ${
                  code.is_used ? "bg-white/5 border-white/5 opacity-60" : "bg-gray-800/50 border-white/10 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${code.is_used ? "bg-white/5 text-gray-500" : "bg-indigo-500/20 text-indigo-400"}`}>#</span>
                    <span className={`font-mono text-xl font-bold tracking-widest ${code.is_used ? "text-gray-500 line-through" : "text-white"}`}>{code.code}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {!code.is_used && (
                      <>
                        <button onClick={() => copyToClipboard(code.code, code.id)} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors" title="Salin">
                          {copiedId === code.id ? <CheckIcon className="h-5 w-5 text-emerald-400" /> : <ClipboardIcon className="h-5 w-5" />}
                        </button>
                        <button onClick={() => openDeleteModal(code.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Hapus">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Used status & patient info */}
                {code.is_used && (
                  <div className="mt-3 space-y-2">
                    <span className="inline-block rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-gray-500">Sudah digunakan</span>
                    {code.registrations && code.registrations.length > 0 && (
                      <div className="mt-2 rounded-lg bg-white/5 p-3 border border-white/5">
                        <p className="text-xs text-gray-500 mb-1">Digunakan oleh:</p>
                        <p className="text-sm font-semibold text-gray-300">{code.registrations[0].nama_lengkap}</p>
                        <p className="text-xs text-gray-500 mt-1">NIK: {code.registrations[0].nik}</p>
                      </div>
                    )}
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

export default Codes;

import { useState, useEffect } from "react";
import { BuildingOfficeIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../lib/supabase";
import ConfirmModal from "../../components/ui/ConfirmModal";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", is_active: true });
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, deptId: null, deptName: "" });
  const [deleting] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await getDepartments(false);
      if (error) throw error;
      setDepartments(data || []);
    } catch {
      setError("Gagal memuat data departemen");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Nama departemen wajib diisi");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        const { error } = await updateDepartment(editingId, formData);
        if (error) throw error;
        setSuccess("Departemen berhasil diperbarui");
      } else {
        const { error } = await createDepartment(formData);
        if (error) throw error;
        setSuccess("Departemen berhasil ditambahkan");
      }

      resetForm();
      loadDepartments();
    } catch {
      setError(editingId ? "Gagal memperbarui departemen" : "Gagal menambah departemen");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dept) => {
    setFormData({ name: dept.name, is_active: dept.is_active });
    setEditingId(dept.id);
    setShowForm(true);
  };

  const openDeleteModal = (dept) => {
    setDeleteModal({ open: true, deptId: dept.id, deptName: dept.name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, deptId: null, deptName: "" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.deptId) return;

    // Simpan state lama untuk rollback
    const previousDepartments = [...departments];
    const idToDelete = deleteModal.deptId;

    // 1. Optimistic Update
    setDepartments((prev) => prev.filter((d) => d.id !== idToDelete));
    closeDeleteModal();
    setSuccess("Departemen berhasil dihapus");

    try {
      // 2. Request ke server
      const { error } = await deleteDepartment(idToDelete);
      if (error) throw error;
    } catch (err) {
      // 3. Rollback
      console.error(err);
      setDepartments(previousDepartments);
      setError("Gagal menghapus departemen");
    }
  };

  const toggleActive = async (dept) => {
    try {
      const { error } = await updateDepartment(dept.id, { is_active: !dept.is_active });
      if (error) throw error;
      loadDepartments();
    } catch {
      setError("Gagal mengubah status departemen");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const activeCount = departments.filter((d) => d.is_active).length;
  const inactiveCount = departments.filter((d) => !d.is_active).length;

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
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Departemen"
        message={`Apakah Anda yakin ingin menghapus departemen "${deleteModal.deptName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
        loading={deleting}
      />

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex">
            <XMarkIcon className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-400">{error}</p>
            <button onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300">
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-emerald-400" />
            <p className="ml-3 text-sm text-emerald-400">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400 hover:text-emerald-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
          <p className="text-sm font-medium text-gray-400">Total Departemen</p>
          <p className="mt-1 text-2xl font-bold text-white">{departments.length}</p>
        </div>
        <div className="rounded-2xl bg-emerald-500/10 backdrop-blur-md p-5 border border-emerald-500/20">
          <p className="text-sm font-medium text-emerald-400">Aktif</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">{activeCount}</p>
        </div>
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5">
          <p className="text-sm font-medium text-gray-400">Non-Aktif</p>
          <p className="mt-1 text-2xl font-bold text-gray-300">{inactiveCount}</p>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{showForm ? (editingId ? "Edit Departemen" : "Tambah Departemen") : "Kelola Departemen"}</h3>
            {!showForm && <p className="mt-1 text-sm text-gray-400">Data master departemen perusahaan</p>}
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 transition-all"
            >
              <PlusIcon className="h-5 w-5" />
              Tambah
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="dept-name" className="block text-sm font-medium text-gray-300">
                Nama Departemen
              </label>
              <input
                type="text"
                id="dept-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Human Resources"
                className="mt-2 block w-full rounded-lg bg-white/5 px-4 py-3 text-base text-white border border-white/10 placeholder:text-gray-500 focus:border-indigo-500 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is-active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-500 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
              />
              <label htmlFor="is-active" className="text-sm text-gray-300">
                Departemen aktif
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                {saving ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    {editingId ? "Perbarui" : "Simpan"}
                  </>
                )}
              </button>
              <button type="button" onClick={resetForm} className="rounded-lg bg-white/5 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                Batal
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Departments List */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar Departemen</h3>
        </div>

        {departments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">Belum ada departemen</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {departments.map((dept) => (
              <div key={dept.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${dept.is_active ? "bg-indigo-500/20 text-indigo-400" : "bg-gray-700/50 text-gray-500"}`}>
                    <BuildingOfficeIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`font-medium ${dept.is_active ? "text-white" : "text-gray-500"}`}>{dept.name}</p>
                    <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-medium ${dept.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-gray-700/50 text-gray-500"}`}>{dept.is_active ? "Aktif" : "Non-Aktif"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(dept)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${dept.is_active ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white" : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"}`}
                  >
                    {dept.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button onClick={() => handleEdit(dept)} className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => openDeleteModal(dept)} className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
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

export default Departments;

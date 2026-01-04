import { useState, useEffect } from "react";
import { UsersIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, KeyIcon } from "@heroicons/react/24/outline";
import { getAllUsers, createUser, updateUserProfile, deleteUser } from "../../lib/supabase";
import ConfirmModal from "../../components/ui/ConfirmModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);

  const [createData, setCreateData] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "fisioterapis",
  });

  const [editData, setEditData] = useState({
    id: null,
    full_name: "",
    role: "",
  });

  const [resetData, setResetData] = useState({
    userId: null,
    userName: "",
    userEmail: "",
  });

  // Delete modal
  const [deleteModal, setDeleteModal] = useState({ open: false, userId: null, userName: "" });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error: fetchError } = await getAllUsers();
      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!createData.email || !createData.password || !createData.full_name) {
      setError("Semua field harus diisi");
      return;
    }

    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const { error: createError } = await createUser(createData.email, createData.password, createData.role, createData.full_name);

      if (createError) throw createError;

      setSuccess("User berhasil dibuat");
      setShowCreateForm(false);
      setCreateData({ email: "", password: "", full_name: "", role: "fisioterapis" });
      loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal membuat user");
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (user) => {
    setEditData({
      id: user.id,
      full_name: user.full_name || "",
      role: user.role || "admin",
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    setEditing(true);
    setError("");
    setSuccess("");

    try {
      const { error: updateError } = await updateUserProfile(editData.id, {
        full_name: editData.full_name,
        role: editData.role,
      });

      if (updateError) throw updateError;

      setSuccess("User berhasil diupdate");
      setShowEditModal(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      setError("Gagal update user");
    } finally {
      setEditing(false);
    }
  };

  const openDeleteModal = (user) => {
    setDeleteModal({
      open: true,
      userId: user.id,
      userName: user.full_name || user.email,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, userId: null, userName: "" });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.userId) return;

    const previousUsers = [...users];
    const idToDelete = deleteModal.userId;

    setUsers((prev) => prev.filter((u) => u.id !== idToDelete));
    closeDeleteModal();
    setSuccess("User berhasil dihapus");

    try {
      const { error } = await deleteUser(idToDelete);
      if (error) throw error;
    } catch (err) {
      console.error(err);
      setUsers(previousUsers);
      setError("Gagal menghapus user");
    }
  };

  const openResetModal = (user) => {
    setResetData({
      userId: user.id,
      userName: user.full_name || user.email,
      userEmail: user.email,
    });
    setShowResetModal(true);
  };

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    }
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
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
      {/* Delete Modal */}
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus User"
        message={`Apakah Anda yakin ingin menghapus user "${deleteModal.userName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        type="danger"
      />

      {/* Alerts */}
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

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex text-emerald-400">
            <CheckIcon className="h-5 w-5 flex-shrink-0" />
            <p className="ml-3 text-sm flex-1">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-300">
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
          <p className="text-sm font-medium text-gray-400">Total Users</p>
          <p className="mt-1 text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-5 border border-white/5 shadow-lg">
          <p className="text-sm font-medium text-gray-400">Fisioterapis</p>
          <p className="mt-1 text-3xl font-bold text-white">{users.filter((u) => u.role === "fisioterapis").length}</p>
        </div>
      </div>

      {/* Create User Form */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300">
          <PlusIcon className="h-5 w-5" />
          {showCreateForm ? "Tutup Form" : "Tambah User Baru"}
        </button>

        {showCreateForm && (
          <form onSubmit={handleCreateUser} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={createData.email}
                  onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                  className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password *</label>
                <input
                  type="password"
                  required
                  value={createData.password}
                  onChange={(e) => setCreateData({ ...createData, password: e.target.value })}
                  className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={createData.full_name}
                  onChange={(e) => setCreateData({ ...createData, full_name: e.target.value })}
                  className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nama lengkap"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                <select
                  value={createData.role}
                  onChange={(e) => setCreateData({ ...createData, role: e.target.value })}
                  className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="fisioterapis">Fisioterapis</option>
                  <option value="dokter">Dokter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={creating} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              {creating ? "Membuat..." : "Buat User"}
            </button>
          </form>
        )}
      </div>

      {/* Users List */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar User ({users.length})</h3>
        </div>

        {users.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-600" />
            <p className="mt-3 text-sm text-gray-400">Belum ada user</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-400">{user.full_name?.charAt(0) || user.email?.charAt(0) || "U"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.full_name || "Belum diisi"}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getRoleBadge(user.role)}`}>{user.role || "admin"}</span>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => openEditModal(user)} className="rounded-lg p-2 text-gray-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors" title="Edit User">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => openResetModal(user)} className="rounded-lg p-2 text-gray-400 hover:bg-yellow-500/10 hover:text-yellow-400 transition-colors" title="Reset Password">
                    <KeyIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => openDeleteModal(user)} className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors" title="Hapus user">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                <input
                  type="text"
                  value={editData.full_name}
                  onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                  className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                <select
                  value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  className="block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="dokter">Dokter</option>
                  <option value="fisioterapis">Fisioterapis</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">
                  Batal
                </button>
                <button type="submit" disabled={editing} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
                  {editing ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20">
                <KeyIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reset Password User</h3>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="rounded-lg bg-gray-900/50 p-4 border border-white/5">
                <p className="text-white font-medium">User: {resetData.userName}</p>
                <p className="text-gray-400 mt-1">Email: {resetData.userEmail}</p>
              </div>

              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-yellow-400 font-medium mb-2">ℹ️ Cara Reset Password:</p>
                <ol className="space-y-2 text-gray-300 list-decimal list-inside">
                  <li>
                    Buka <strong>Supabase Dashboard</strong>
                  </li>
                  <li>
                    Pilih <strong>Authentication → Users</strong>
                  </li>
                  <li>
                    Cari user: <code className="bg-gray-900 px-2 py-0.5 rounded text-yellow-400">{resetData.userEmail}</code>
                  </li>
                  <li>Klik pada user tersebut</li>
                  <li>
                    Klik <strong>"Reset Password"</strong> atau <strong>"Send recovery email"</strong>
                  </li>
                </ol>
              </div>

              <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                <p className="text-blue-400 font-medium mb-2">🔗 Quick Link:</p>
                <a
                  href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_URL?.split(".")[0]?.replace("https://", "")}/auth/users`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-200 underline break-all"
                >
                  Buka Supabase Authentication →
                </a>
              </div>

              <div className="text-xs text-gray-500 border-t border-white/5 pt-3">
                💡 <strong>Tips:</strong> Setelah reset, user akan menerima email untuk set password baru. Pastikan Email Auth sudah aktif di Supabase.
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={() => setShowResetModal(false)} className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-600">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

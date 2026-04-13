import { useState, useEffect } from "react";
import { ChatBubbleLeftRightIcon, PencilSquareIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { getWhatsAppMessages, updateWhatsAppMessage } from "../../lib/api";

const WhatsAppMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await getWhatsAppMessages();
      if (error) throw error;
      setMessages(data || []);
    } catch {
      setError("Gagal memuat daftar pesan WhatsApp");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (msg) => {
    setEditingId(msg.id);
    setEditContent(msg.content);
    setError("");
    setSuccess("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const handleUpdate = async (id) => {
    setUpdating(true);
    setError("");
    try {
      const { error } = await updateWhatsAppMessage(id, editContent);
      if (error) throw error;
      
      setSuccess("Pesan WhatsApp berhasil diperbarui");
      setEditingId(null);
      loadMessages();
    } catch {
      setError("Gagal memperbarui pesan");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-white">Manajemen Pesan WhatsApp</h2>
        <p className="text-gray-400">Kelola template pesan otomatis untuk pendaftaran dan layanan lainnya.</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <div className="flex text-red-400">
            <p className="text-sm">{error}</p>
            <button onClick={() => setError("")} className="ml-auto hover:text-red-300">×</button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex text-emerald-400">
            <CheckIcon className="h-5 w-5" />
            <p className="ml-3 text-sm">{success}</p>
            <button onClick={() => setSuccess("")} className="ml-auto hover:text-emerald-300">×</button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 text-center p-6">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-600 mb-4" />
            <p className="text-gray-400">Belum ada template pesan tersimpan di database.</p>
            <p className="text-sm text-gray-500 mt-2">Gunakan seeder untuk mengisi data awal.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 overflow-hidden shadow-lg transition-all hover:shadow-indigo-500/5">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                    <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white uppercase tracking-wider">{msg.name}</h3>
                    <p className="text-xs text-gray-500">Terakhir diperbarui: {new Date(msg.updatedAt).toLocaleString("id-ID")}</p>
                  </div>
                </div>
                
                {editingId !== msg.id && (
                  <button
                    onClick={() => startEdit(msg)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 px-4 py-2 text-sm font-semibold text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-sm ring-1 ring-inset ring-indigo-500/30"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Edit Template
                  </button>
                )}
              </div>

              <div className="p-6">
                {editingId === msg.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Isi Pesan (Gunakan [CODE] sebagai placeholder kode akses)</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={12}
                        className="block w-full rounded-xl bg-gray-900/50 border border-white/10 p-4 text-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-mono text-sm leading-relaxed"
                        placeholder="Masukkan template pesan WhatsApp di sini..."
                      />
                    </div>
                    
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={cancelEdit}
                        className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleUpdate(msg.id)}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all disabled:opacity-50"
                      >
                        {updating ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        Simpan Perubahan
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="rounded-xl bg-gray-950/50 border border-white/5 p-5 font-mono text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] bg-gray-800 text-gray-500 px-2 py-1 rounded-md border border-white/5">PREVIEW MODE</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Guide Section */}
      <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 mt-8">
        <h4 className="text-indigo-400 font-bold mb-3 flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Petunjuk Penggunaan Template
        </h4>
        <ul className="text-sm text-gray-400 space-y-2 list-disc list-inside">
          <li>Gunakan tag <code className="text-indigo-300 font-bold">[CODE]</code> untuk menandai di mana kode akses 4 Digit akan disisipkan otomatis.</li>
          <li>Format WhatsApp (tebal: <code className="text-indigo-300">*Teks*</code>, miring: <code className="text-indigo-300">_Teks_</code>, coret: <code className="text-indigo-300">~Teks~</code>) tetap didukung.</li>
          <li>Pesan ini akan muncul saat Admin mengklik tombol Salin WA di menu <strong className="text-gray-300">Kode Akses</strong>.</li>
        </ul>
      </div>
    </div>
  );
};

export default WhatsAppMessages;

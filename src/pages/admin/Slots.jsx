import { useState, useEffect } from "react";
import { CalendarDaysIcon, PlusIcon, TrashIcon, CheckIcon } from "@heroicons/react/24/outline";
import { getSlotsGroupedByDate, generateSlots, deleteSlot } from "../../lib/supabase";
import ConfirmModal from "../../components/ui/ConfirmModal";

const Slots = () => {
  const [slotsGrouped, setSlotsGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHours, setSelectedHours] = useState([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, slotId: null });
  const [deleting] = useState(false);

  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 - 22:00

  useEffect(() => {
    loadSlots();
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const loadSlots = async () => {
    try {
      const { data, error } = await getSlotsGroupedByDate();
      if (error) throw error;
      setSlotsGrouped(data || {});
    } catch {
      setError("Gagal memuat data slot");
    } finally {
      setLoading(false);
    }
  };

  const toggleHour = (hour) => {
    setSelectedHours((prev) => (prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]));
  };

  const selectAllHours = () => {
    setSelectedHours(hours);
  };

  const clearSelectedHours = () => {
    setSelectedHours([]);
  };

  const handleGenerate = async () => {
    if (!selectedDate || selectedHours.length === 0) {
      setError("Pilih tanggal dan minimal 1 jam");
      return;
    }

    setGenerating(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await generateSlots(selectedDate, selectedHours);
      if (error) throw error;

      setSuccess(`Berhasil membuat ${selectedHours.length} slot untuk tanggal ${selectedDate}`);
      setSelectedHours([]);
      loadSlots();
    } catch {
      setError("Gagal membuat slot. Mungkin sudah ada slot yang sama.");
    } finally {
      setGenerating(false);
    }
  };

  const openDeleteModal = (slotId) => {
    setDeleteModal({ open: true, slotId });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false, slotId: null });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.slotId) return;

    const previousSlots = { ...slotsGrouped };
    const idToDelete = deleteModal.slotId;

    // 1. Optimistic Update
    const newSlotsGrouped = { ...slotsGrouped };
    for (const date in newSlotsGrouped) {
      if (newSlotsGrouped[date].some((s) => s.id === idToDelete)) {
        newSlotsGrouped[date] = newSlotsGrouped[date].filter((s) => s.id !== idToDelete);
        if (newSlotsGrouped[date].length === 0) {
          delete newSlotsGrouped[date];
        }
        break;
      }
    }

    setSlotsGrouped(newSlotsGrouped);
    closeDeleteModal();

    try {
      const { error } = await deleteSlot(idToDelete);
      if (error) throw error;
    } catch {
      setSlotsGrouped(previousSlots);
      setError("Gagal menghapus slot");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-3 text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ConfirmModal
        open={deleteModal.open}
        onClose={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Hapus Slot"
        message="Apakah Anda yakin ingin menghapus slot ini? Tindakan ini tidak dapat dibatalkan."
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

      {/* Generate Slots Form */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-white">Buat Slot Baru</h3>
        <p className="mt-1 text-sm text-gray-400">Pilih tanggal dan jam untuk slot yang ingin dibuat</p>

        <div className="mt-6 space-y-6">
          {/* Date Picker */}
          <div>
            <label htmlFor="slot-date" className="block text-sm font-medium text-gray-300">
              Tanggal
            </label>
            <input
              type="date"
              id="slot-date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="mt-2 block w-full max-w-xs rounded-lg bg-white/5 px-4 py-3 text-base text-white border border-white/10 focus:border-indigo-500 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 [color-scheme:dark]"
            />
          </div>

          {/* Hour Selection */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-300">Pilih Jam ({selectedHours.length} dipilih)</label>
              <div className="flex gap-2">
                <button type="button" onClick={selectAllHours} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                  Pilih Semua
                </button>
                <span className="text-gray-600">|</span>
                <button type="button" onClick={clearSelectedHours} className="text-sm font-medium text-gray-400 hover:text-gray-300">
                  Hapus Semua
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
              {hours.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => toggleHour(hour)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    selectedHours.includes(hour) ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {String(hour).padStart(2, "0")}:00
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !selectedDate || selectedHours.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
          >
            {generating ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Membuat...
              </>
            ) : (
              <>
                <PlusIcon className="h-5 w-5" />
                Buat {selectedHours.length} Slot
              </>
            )}
          </button>
        </div>
      </div>

      {/* Existing Slots */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Daftar Slot</h3>
        </div>
        <div className="divide-y divide-white/5">
          {Object.keys(slotsGrouped).length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-600" />
              <p className="mt-3 text-sm text-gray-400">Belum ada slot</p>
            </div>
          ) : (
            Object.entries(slotsGrouped).map(([date, slots]) => (
              <div key={date} className="px-6 py-4 hover:bg-white/5 transition-colors">
                <h4 className="mb-3 font-medium text-white">{formatDate(date)}</h4>
                <div className="flex flex-wrap gap-2">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm border ${slot.is_booked ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                    >
                      <span className={`h-2 w-2 rounded-full ${slot.is_booked ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"}`} />
                      {formatHour(slot.hour)}
                      {!slot.is_booked && (
                        <button onClick={() => openDeleteModal(slot.id)} className="ml-1 rounded p-0.5 text-emerald-400/70 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Slots;

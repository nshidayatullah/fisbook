import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateAccessCode } from "../lib/supabase";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const Home = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCodeChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    if (value && index < 3) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (/^\d{1,4}$/.test(pastedData)) {
      const newCode = pastedData.split("").concat(["", "", "", ""]).slice(0, 4);
      setCode(newCode);
      const lastIndex = Math.min(pastedData.length - 1, 3);
      const input = document.getElementById(`code-${lastIndex}`);
      input?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");

    if (fullCode.length !== 4) {
      setError("Masukkan 4 digit kode akses");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: apiError } = await validateAccessCode(fullCode);

      if (apiError || !data) {
        setError("Kode tidak valid atau sudah digunakan");
        setLoading(false);
        return;
      }

      // Save code to local storage for Register page to use
      localStorage.setItem("accessCode", fullCode);
      localStorage.setItem("accessCodeId", data.id);

      navigate("/register");
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img src="/landing-bg.png" alt="Background Fisioterapi" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 to-gray-900/60 mix-blend-multiply" />
      </div>

      <div className="relative flex min-h-screen flex-col justify-between px-6 py-12 lg:px-8">
        <div className="my-auto sm:mx-auto sm:w-full sm:max-w-[480px]">
          {/* Logo & Brand */}
          <div className="mb-10 text-center">
            <img src="/logo.png" alt="PhysioBook Logo" className="mx-auto h-24 w-auto drop-shadow-2xl" />
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl drop-shadow-lg">PhysioBook</h1>
            <p className="mt-4 text-lg font-medium leading-6 text-white drop-shadow-md">Layanan Fisioterapi Profesional untuk Kesehatan & Produktivitas Karyawan</p>
          </div>

          {/* Access Code Card */}
          <div className="bg-white/10 px-6 py-12 shadow-2xl backdrop-blur-md sm:rounded-3xl sm:px-12 outline outline-1 outline-white/20">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white drop-shadow-sm">Mulai Pendaftaran</h3>
              <p className="mt-2 text-sm font-medium text-white/90">Masukkan 4 digit kode akses yang Anda terima</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20">
                  <p className="text-center text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              <div className="flex justify-center gap-3 sm:gap-4">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="h-14 w-12 rounded-xl border border-white/20 bg-white/5 text-center text-2xl font-bold text-white shadow-sm transition-all focus:border-indigo-500 focus:bg-white/10 focus:ring-1 focus:ring-indigo-500 sm:h-16 sm:w-14 sm:text-3xl"
                    autoComplete="off"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    Lanjutkan Pendaftaran
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-sm text-gray-400">
            <span className="opacity-75">Butuh bantuan?</span>{" "}
            <a href="mailto:support@physiobook.com" className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline">
              Hubungi Admin
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500 sm:mt-0">
          <p>&copy; 2026 PhysioBook. All rights reserved.</p>
          <div className="mt-2 text-center">
            <a href="/admin/login" className="text-gray-600 hover:text-white transition-colors">
              Login Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

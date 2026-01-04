import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, getUserProfile } from "../../lib/supabase";

const FisioterapisLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await signIn(formData.email, formData.password);

      if (signInError) {
        setError("Email atau password salah");
        setLoading(false);
        return;
      }

      // Check user role
      const { data: profile, error: profileError } = await getUserProfile(data.user.id);

      if (profileError || !profile) {
        setError("Gagal memuat profil pengguna");
        setLoading(false);
        return;
      }

      if (profile.role !== "fisioterapis") {
        setError("Akun Anda bukan Fisioterapis. Silakan gunakan portal yang sesuai.");
        setLoading(false);
        return;
      }

      navigate("/fisioterapis/dashboard");
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Title */}
          <div className="flex justify-center">
            <img src="/logo.png" alt="PhysioBook Logo" className="h-20 w-auto" />
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">Portal Fisioterapis</h2>
            <p className="mt-2 text-gray-400">Masuk untuk mengelola rekam medis pasien</p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl bg-gray-800/50 backdrop-blur-xl p-8 shadow-2xl border border-white/10">
            {error && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-center text-sm text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-2 block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500"
                  placeholder="fisioterapis@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-2 block w-full rounded-lg bg-white/5 px-4 py-3 text-white border border-white/10 placeholder:text-gray-500 focus:border-emerald-500 focus:bg-white/10 focus:ring-1 focus:ring-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:shadow-emerald-500/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Memuat...
                  </div>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>
          </div>

          {/* Footer Links */}
          <div className="text-center text-sm text-gray-500">
            <a href="/admin/login" className="hover:text-emerald-400 transition-colors">
              Login sebagai Admin
            </a>
            {" · "}
            <a href="/" className="hover:text-emerald-400 transition-colors">
              Halaman Utama
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FisioterapisLogin;

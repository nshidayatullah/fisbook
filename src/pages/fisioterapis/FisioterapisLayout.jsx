import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { signOut, getCurrentUser, getUserProfile } from "../../lib/supabase";
import AppFooter from "../../components/ui/AppFooter";

const navigation = [
  { name: "Antrian Pasien", href: "/fisioterapis/dashboard", icon: ClipboardDocumentListIcon },
  { name: "Riwayat Pelayanan", href: "/fisioterapis/history", icon: CheckCircleIcon },
];

const FisioterapisLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        navigate("/fisioterapis/login");
        return;
      }

      const { data: profile } = await getUserProfile(user.id);

      if (!profile || profile.role !== "fisioterapis") {
        navigate("/fisioterapis/login");
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error(error);
      navigate("/fisioterapis/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/fisioterapis/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 animate-spin text-emerald-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-3 text-gray-400">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-emerald-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <XMarkIcon className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/90 backdrop-blur-xl px-6 pb-4 border-r border-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  <img className="h-10 w-auto" src="/logo.png" alt="PhysioBook" />
                  <span className="ml-3 text-lg font-bold text-white">Fisioterapis</span>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                className={`group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-all ${
                                  isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                              >
                                <item.icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/90 backdrop-blur-xl px-6 pb-4 border-r border-white/10">
          <div className="flex h-16 shrink-0 items-center">
            <img className="h-10 w-auto" src="/logo.png" alt="PhysioBook" />
            <span className="ml-3 text-lg font-bold text-white">Fisioterapis</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={`group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 transition-all ${
                            isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <item.icon className="h-6 w-6 shrink-0" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72 relative z-10">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 lg:px-8">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <span className="text-sm font-medium text-gray-400">{userProfile?.full_name || userProfile?.email || "Fisioterapis"}</span>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button onClick={handleLogout} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default FisioterapisLayout;

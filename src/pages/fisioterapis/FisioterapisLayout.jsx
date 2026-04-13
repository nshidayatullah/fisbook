import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, CheckCircleIcon, UserCircleIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { signOut, getCurrentUser, getUserProfile } from "../../lib/api";
import AppFooter from "../../components/ui/AppFooter";
import PageTransition from "../../components/ui/PageTransition";

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
      const authUser = await getCurrentUser();

      if (!authUser) {
        navigate("/login");
        return;
      }

      const { data: profile } = await getUserProfile(authUser.id);

      if (!profile || profile.role !== "fisioterapis") {
        navigate("/login");
        return;
      }

      setUserProfile(profile);
    } catch (error) {
      console.error(error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
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
    <div className="relative min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-emerald-900">
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
                    <li className="mt-auto">
                      <button onClick={handleLogout} className="group -mx-2 flex w-full gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                        <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-400" />
                        Keluar
                      </button>
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
              <li className="mt-auto">
                <button onClick={handleLogout} className="group -mx-2 flex w-full gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                  <ArrowRightOnRectangleIcon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-400" />
                  Keluar
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="lg:pl-72 relative z-10 flex flex-col min-h-screen">
        {/* Top header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 lg:px-8">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-gray-400 lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Separator mobile */}
          <div aria-hidden="true" className="h-6 w-px bg-white/10 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-white">{navigation.find((item) => item.href === location.pathname)?.name || "Fisioterapis Panel"}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-x-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-white/10">
                    <UserCircleIcon className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span aria-hidden="true" className="text-sm font-semibold text-white ml-2">
                      {userProfile?.fullName || userProfile?.full_name || userProfile?.email?.split("@")[0] || "Fisioterapis"}
                    </span>
                    <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-gray-800 py-2 shadow-lg ring-1 ring-white/5 transition focus:outline-none data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                >
                  <MenuItem>
                    <div className="block px-3 py-2 text-sm text-gray-400 border-b border-white/5">{userProfile?.email}</div>
                  </MenuItem>
                  <MenuItem>
                    <button onClick={handleLogout} className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300">
                      Keluar
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 grow">
          <div className="px-4 sm:px-6 lg:px-8">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>
        <AppFooter />
      </div>
    </div>
  );
};

export default FisioterapisLayout;

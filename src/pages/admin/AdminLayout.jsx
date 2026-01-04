import { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Bars3Icon, XMarkIcon, HomeIcon, CalendarDaysIcon, KeyIcon, ClipboardDocumentListIcon, BuildingOfficeIcon, ArrowRightOnRectangleIcon, ChevronDownIcon, UserCircleIcon, UsersIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../hooks/useAuth";
import { signOut, getUserProfile } from "../../lib/supabase";
import Footer from "../../components/ui/Footer";

const allNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
  { name: "Kelola Slot", href: "/admin/slots", icon: CalendarDaysIcon },
  { name: "Kode Akses", href: "/admin/codes", icon: KeyIcon },
  { name: "Pendaftaran", href: "/admin/registrations", icon: ClipboardDocumentListIcon },
  { name: "Departemen", href: "/admin/departments", icon: BuildingOfficeIcon },
  { name: "Antrian Pasien", href: "/admin/patients", icon: UsersIcon, dokterOnly: true },
  { name: "Riwayat Pelayanan", href: "/admin/history", icon: ClockIcon, dokterOnly: true },
  { name: "Manajemen User", href: "/admin/users", icon: UserCircleIcon, adminOnly: true },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data } = await getUserProfile(user.id);
      setUserProfile(data);
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  };

  useEffect(() => {
    loadUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Filter navigation based on role
  const navigation = allNavigation.filter((item) => {
    // Hide Users menu for dokter
    if (item.adminOnly && userProfile?.role === "dokter") {
      return false;
    }
    // Show patient/history menus ONLY for dokter
    if (item.dokterOnly && userProfile?.role !== "dokter") {
      return false;
    }
    return true;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-indigo-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-4 text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/admin/login");
    return null;
  }

  return (
    <div className="relative min-h-screen bg-gray-900">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute top-1/2 -left-40 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      {/* Mobile sidebar */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
        <DialogBackdrop transition className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300 ease-linear data-[closed]:opacity-0" />

        <div className="fixed inset-0 flex">
          <DialogPanel transition className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full">
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            {/* Mobile Sidebar Content - Glass */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900/90 backdrop-blur-xl px-6 pb-4 ring-1 ring-white/10">
              <div className="flex h-16 shrink-0 items-center">
                <img src="/logo.png" alt="PhysioBook Logo" className="h-10 w-auto" />
                <span className="ml-3 text-xl font-bold text-white">PhysioBook</span>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={classNames(
                                isActive ? "bg-indigo-500/20 text-white shadow-sm ring-1 ring-inset ring-indigo-500/30" : "text-gray-400 hover:bg-white/5 hover:text-white",
                                "group flex gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 transition-all"
                              )}
                            >
                              <item.icon aria-hidden="true" className={classNames(isActive ? "text-indigo-400" : "text-gray-400 group-hover:text-white", "h-6 w-6 shrink-0")} />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                  <li className="mt-auto">
                    <button onClick={handleSignOut} className="group -mx-2 flex w-full gap-x-3 rounded-lg p-2 text-sm font-semibold leading-6 text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                      <ArrowRightOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-400" />
                      Keluar
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        {/* Glass Sidebar */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-white/5 bg-gray-900/50 backdrop-blur-xl px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <img src="/logo.png" alt="PhysioBook Logo" className="h-10 w-auto" />
            <span className="ml-3 text-xl font-bold text-white">PhysioBook</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          className={classNames(
                            isActive ? "bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-inset ring-indigo-500/30" : "text-gray-400 hover:bg-white/5 hover:text-white",
                            "group flex gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 transition-all duration-200"
                          )}
                        >
                          <item.icon aria-hidden="true" className={classNames(isActive ? "text-indigo-400" : "text-gray-400 group-hover:text-white", "h-6 w-6 shrink-0 transition-colors")} />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <button onClick={handleSignOut} className="group -mx-2 flex w-full gap-x-3 rounded-xl p-2.5 text-sm font-semibold leading-6 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
                  <ArrowRightOnRectangleIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-400" />
                  Keluar
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72 relative z-10">
        {/* Top header - Glass */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-white/5 bg-gray-900/50 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-white lg:hidden">
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>

          {/* Separator mobile */}
          <div aria-hidden="true" className="h-6 w-px bg-white/10 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg font-semibold text-white">{navigation.find((item) => item.href === location.pathname)?.name || "Admin Panel"}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center gap-x-2 rounded-lg p-1.5 hover:bg-white/5 transition-colors">
                  <span className="sr-only">Open user menu</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 ring-1 ring-white/10">
                    <UserCircleIcon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span aria-hidden="true" className="text-sm font-semibold text-white ml-2">
                      {user?.email?.split("@")[0] || "Admin"}
                    </span>
                    <ChevronDownIcon aria-hidden="true" className="ml-2 h-5 w-5 text-gray-400" />
                  </span>
                </MenuButton>
                <MenuItems
                  transition
                  className="absolute right-0 z-10 mt-2.5 w-48 origin-top-right rounded-xl bg-gray-800 py-2 shadow-lg ring-1 ring-white/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in"
                >
                  <MenuItem>
                    <div className="block px-3 py-2 text-sm text-gray-400 border-b border-white/5">{user?.email}</div>
                  </MenuItem>
                  <MenuItem>
                    <button onClick={handleSignOut} className="block w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5 hover:text-red-300">
                      Keluar
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;

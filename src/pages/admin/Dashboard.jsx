import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDaysIcon, KeyIcon, ClipboardDocumentListIcon, BuildingOfficeIcon, ArrowTrendingUpIcon, UsersIcon } from "@heroicons/react/24/outline";
import { getDashboardStats, getRegistrations } from "../../lib/api";

import { SkeletonStat, SkeletonTableRow } from "../../components/ui/Skeleton";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResult, regsResult] = await Promise.all([getDashboardStats(), getRegistrations()]);

      if (statsResult.data) {
        setStats(statsResult.data);
      }

      if (regsResult.data) {
        setRecentRegistrations(regsResult.data.slice(0, 5));
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: "Total Pendaftaran",
      value: stats?.total_registrations || 0,
      icon: ClipboardDocumentListIcon,
      color: "bg-blue-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      href: "/admin/registrations",
    },
    {
      name: "Slot Tersedia",
      value: stats?.available_slots || 0,
      icon: CalendarDaysIcon,
      color: "bg-emerald-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
      href: "/admin/slots",
    },
    {
      name: "Kode Tersedia",
      value: stats?.available_codes || 0,
      icon: KeyIcon,
      color: "bg-amber-500",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      href: "/admin/codes",
    },
    {
      name: "Departemen",
      value: stats?.total_departments || 0,
      icon: BuildingOfficeIcon,
      color: "bg-purple-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
      href: "/admin/departments",
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatHour = (hour) => {
    return `${String(hour).padStart(2, "0")}:00`;
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white shadow-lg shadow-indigo-500/20 border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Selamat Datang! 👋</h2>
            <p className="mt-1 text-indigo-100">Kelola pendaftaran fisioterapi dengan mudah</p>
          </div>
          <div className="hidden sm:block">
            <ArrowTrendingUpIcon className="h-16 w-16 text-indigo-300/30" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
          : statCards.map((item) => (
              <Link key={item.name} to={item.href} className="group relative overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg transition hover:bg-gray-800/70 hover:shadow-xl">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bgColor}`}>
                    <item.icon className={`h-6 w-6 ${item.textColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-400">{item.name}</p>
                    <p className="text-2xl font-bold text-white">{item.value}</p>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 h-1 w-full ${item.color} transition-all group-hover:h-1.5 opacity-80`} />
              </Link>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md p-6 border border-white/5 shadow-lg">
        <h3 className="text-lg font-semibold text-white">Aksi Cepat</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link to="/admin/slots" className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 text-emerald-400 transition hover:bg-emerald-500/20 border border-emerald-500/20">
            <CalendarDaysIcon className="h-5 w-5" />
            <span className="font-medium">Buat Slot Baru</span>
          </Link>
          <Link to="/admin/codes" className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-4 text-amber-400 transition hover:bg-amber-500/20 border border-amber-500/20">
            <KeyIcon className="h-5 w-5" />
            <span className="font-medium">Generate Kode</span>
          </Link>
          <Link to="/admin/registrations" className="flex items-center gap-3 rounded-xl bg-blue-500/10 p-4 text-blue-400 transition hover:bg-blue-500/20 border border-blue-500/20">
            <UsersIcon className="h-5 w-5" />
            <span className="font-medium">Lihat Registrasi</span>
          </Link>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="rounded-2xl bg-gray-800/50 backdrop-blur-md border border-white/5 shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="text-lg font-semibold text-white">Pendaftaran Terbaru</h3>
          <Link to="/admin/registrations" className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
            Lihat Semua →
          </Link>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-white/5" />
                    <div className="h-3 w-24 animate-pulse rounded bg-white/5" />
                  </div>
                </div>
              </div>
            ))
          ) : recentRegistrations.length === 0 ? (
            recentRegistrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 text-sm font-bold text-indigo-400 ring-1 ring-inset ring-indigo-500/30">{reg.nama_lengkap?.charAt(0) || "?"}</div>
                  <div>
                    <p className="font-medium text-white">{reg.nama_lengkap}</p>
                    <p className="text-sm text-gray-400">{reg.departments?.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{formatDate(reg.slots?.date)}</p>
                  <p className="text-sm text-gray-400">{formatHour(reg.slots?.hour)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

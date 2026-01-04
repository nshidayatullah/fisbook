// Simple footer for authenticated layouts (Admin/Fisioterapis)
// No login links, just copyright and developer credit

const AppFooter = () => {
  return (
    <footer className="mt-auto py-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Copyright */}
        <div className="text-center text-sm text-gray-500 mb-3">© 2026 PhysioBook. All rights reserved.</div>

        {/* Developer */}
        <div className="text-center text-sm text-gray-400">
          Developed by: <span className="font-semibold text-gray-300">Medic Hidayatullah</span>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;

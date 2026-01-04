import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section - Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <Link to="/admin/login" className="text-sm text-gray-400 hover:text-blue-400 transition-colors font-medium">
            Login Admin
          </Link>
          <span className="hidden sm:inline text-gray-600">·</span>
          <Link to="/fisioterapis/login" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors font-medium">
            Login Fisioterapis
          </Link>
        </div>

        {/* Middle section - Copyright */}
        <div className="text-center text-sm text-gray-500 mb-3">© 2026 PhysioBook. All rights reserved.</div>

        {/* Bottom section - Developer */}
        <div className="text-center text-sm text-gray-400">
          Developed by: <span className="font-semibold text-gray-300">Medic Hidayatullah</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

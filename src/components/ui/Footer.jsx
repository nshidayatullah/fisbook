import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto py-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top section - Login Link */}
        <div className="flex items-center justify-center mb-4">
          <Link to="/login" className="text-sm text-gray-400 hover:text-blue-400 transition-colors font-medium">
            Login Staff / Tenaga Medis
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

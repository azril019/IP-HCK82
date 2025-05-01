import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active-link" : "";
  };

  return (
    <nav className="custom-nav p-4 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="flex items-center">
          <img className="h-17" src="/Logo.png" alt="Logo" />
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        {/* Desktop navigation */}
        <ul className="hidden md:flex space-x-6 items-center">
          <li>
            <Link
              to="/home/profile"
              className={`nav-link ${isActive("/home/profile")}`}
            >
              <span className="mr-1">👤</span> Profile
            </Link>
          </li>
          <li>
            <Link
              to="/home/preference"
              className={`nav-link ${isActive("/home/preference")}`}
            >
              <span className="mr-1">💼</span> Preferences
            </Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#6a64f1] py-2 shadow-lg">
          <div className="container mx-auto px-4">
            <Link
              to="/home/profile"
              className="block py-3 nav-link-mobile"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">👤</span> Profile
            </Link>
            <Link
              to="/home/preference"
              className="block py-3 nav-link-mobile"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mr-2">💼</span> Preferences
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left py-3 nav-link-mobile"
            >
              <span className="mr-2">🚪</span> Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-nav {
          background-color: #6a64f1;
        }
        .nav-link {
          font-weight: 500;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        .nav-link:hover {
          background-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .active-link {
          background-color: rgba(255, 255, 255, 0.15);
          font-weight: 600;
        }
        .nav-link-mobile {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          transition: background-color 0.3s ease;
          display: flex;
          align-items: center;
        }
        .nav-link-mobile:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .logout-button {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .logout-button:hover {
          background-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
      `}</style>
    </nav>
  );
}

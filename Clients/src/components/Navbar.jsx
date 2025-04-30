import { Link, useNavigate } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
  };

  return (
    <nav className="custom-nav p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={"/home"}>
          <img style={{ width: "25%" }} src="/Logo.png" alt="Logo" />
        </Link>
        <ul className="flex space-x-4">
          <li>
            <a
              href="/home/profile"
              className="hover:text-indigo-200 transition-colors duration-200 text-white"
            >
              👤 User
            </a>
          </li>
          <li>
            <a
              href="/home/preference"
              className="hover:text-indigo-200 transition-colors duration-200 text-white"
            >
              💼 Preferences
            </a>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="hover:text-indigo-200 transition-colors duration-200 text-white"
            >
              🫂 Logout
            </button>
          </li>
        </ul>
      </div>

      <style jsx>{`
        .custom-nav {
          background-color: #6a64f1;
        }
      `}</style>
    </nav>
  );
}

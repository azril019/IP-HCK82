import { Link, useNavigate } from "react-router";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    navigate("/");
  };
  return (
    <nav className="bg-blue-600 p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to={"/home"}>
          <img style={{ width: "20%" }} src="/Logo.png" alt="Logo" />
        </Link>
        <ul className="flex space-x-4">
          <li>
            <a href="/home/profile" className="hover:underline text-white">
              👤User
            </a>
          </li>
          <li>
            <a href="/home/preference" className="hover:underline text-white">
              💼Preferences
            </a>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="hover:underline text-white"
            >
              🫂Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

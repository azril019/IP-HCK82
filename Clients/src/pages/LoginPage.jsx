import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/home");
    }
    signInGoogle();
  }, [navigate]);

  async function handleCredentialResponse(response) {
    console.log("Encoded JWT ID Token: " + response.credential);
    setLoading(true);
    try {
      const result = await axios.post("http://localhost:3000/google-login", {
        googleToken: response.credential,
      });

      localStorage.setItem("access_token", result.data.access_token);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Login berhasil!",
      });
      navigate("/home");
    } catch (error) {
      console.log("🚀 ~ handlCredentialResponse ~ error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan saat login!",
      });
    } finally {
      setLoading(false);
    }
  }

  function signInGoogle() {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });
    google.accounts.id.renderButton(document.getElementById("buttonDiv"), {
      theme: "outline",
      size: "large",
    });
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Email dan password harus diisi!",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await phase2Api.post("/login", formData);

      localStorage.setItem("access_token", response.data.access_token);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Login berhasil!",
      });

      navigate("/home");
    } catch (error) {
      console.error("🚀 ~ handleSubmit ~ error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan saat login!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl shadow-2xl rounded-2xl overflow-hidden">
        {/* Left side - Decorative section */}
        <div className="hidden md:block w-1/2 custom-bg p-12 relative">
          <div className="absolute inset-0 opacity-20 bg-pattern"></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Selamat Datang di MAKARYA
            </h2>
            <p className="text-indigo-100 mb-8">
              Platform AI yang menghubungkan talenta dengan pekerjaan impian
              mereka
            </p>
            <div className="flex gap-2 items-center">
              <div className="h-1 w-12 bg-indigo-300 rounded-full"></div>
              <div className="h-1 w-24 bg-indigo-300 rounded-full"></div>
              <div className="h-1 w-8 bg-indigo-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full md:w-1/2 bg-white p-8 md:p-12">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-8 h-8 text-custom-base"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          </div>

          <h2 className="text-center text-2xl font-bold text-indigo-900 mb-6">
            Login ke Akun Anda
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-indigo-800 font-medium">
                  Email
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 text-custom-base"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10 border-indigo-300 focus:border-custom-base focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                  id="email"
                  name="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-indigo-800 font-medium">
                  Password
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-5 h-5 text-custom-base"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  type="password"
                  className="input input-bordered w-full pl-10 border-indigo-300 focus:border-custom-base focus:ring-2 focus:ring-indigo-300 transition-all duration-200"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-control mt-6">
              <button
                type="submit"
                className={`btn text-white w-full custom-button ${
                  loading ? "loading" : ""
                }`}
                disabled={loading}
              >
                {loading ? "Processing..." : "Login"}
              </button>
            </div>

            <div className="divider text-purple-600 text-sm">
              atau login dengan
            </div>

            <div className="flex justify-center" id="buttonDiv">
              {/* Google sign-in button will be rendered here */}
            </div>

            <div className="text-center text-sm mt-6">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <a
                  href="/register"
                  className="font-medium text-custom-base hover:text-indigo-800"
                >
                  Daftar Sekarang
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .bg-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        .custom-bg {
          background-color: #6a64f1;
        }
        .custom-button {
          background-color: #6a64f1 !important;
          border: none;
        }
        .custom-button:hover {
          background-color: #5a54d1 !important;
        }
        .text-custom-base {
          color: #6a64f1;
        }
        input:focus {
          border-color: #6a64f1 !important;
        }
      `}</style>
    </div>
  );
}

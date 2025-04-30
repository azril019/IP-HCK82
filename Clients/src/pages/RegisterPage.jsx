import { useState } from "react";
import { useNavigate, Link } from "react-router";
import Swal from "sweetalert2";
import { phase2Api } from "../helpers/http-clients";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Semua field harus diisi!",
      });
      return;
    }

    try {
      const response = await phase2Api.post("/register", formData);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "User berhasil didaftarkan!",
      });
      console.log(response.data);
      navigate("/login");
    } catch (error) {
      console.error("🚀 ~ handleSubmit ~ error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan!",
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        background: "url('/BG.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#6a64f1]">Register</h2>
            <p className="mt-2 text-gray-600">
              Daftar untuk meneruskan ke halaman selanjutnya
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Nama
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input-field"
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-field"
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-field"
                placeholder="Masukkan password Anda"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center justify-center mt-6">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="font-medium text-[#6a64f1] hover:text-[#5a54d1] transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>

            <button type="submit" className="custom-button">
              Daftar
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: #6a64f1;
          box-shadow: 0 0 0 3px rgba(106, 100, 241, 0.15);
        }
        .custom-button {
          width: 100%;
          background-color: #6a64f1;
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .custom-button:hover {
          background-color: #5a54d1;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.3);
        }
      `}</style>
    </div>
  );
}

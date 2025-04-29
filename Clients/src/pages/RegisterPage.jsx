import { useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2"; // Pastikan Anda mengimpor Swal
import { phase2Api } from "../helpers/http-clients";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target; // Perbaikan di sini
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi sederhana
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
    <>
      <div
        className="container"
        style={{
          background: "url('/BG.jpg')",
          backgroundSize: "cover",
          maxWidth: "100%",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          className="form-container p-4 rounded shadow"
          style={{
            background: "rgba(255, 255, 255, 0.9)",
            color: "black",
            border: "1px solid #ccc",
          }}
        >
          <h2 className="text-center">Register</h2>
          <h5>Daftar untuk meneruskan ke halaman selanjutnya</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">
                Nama
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name" // Tambahkan atribut name
                placeholder="Masukkan nama Anda"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email" // Tambahkan atribut name
                placeholder="Masukkan email Anda"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                name="password" // Tambahkan atribut name
                placeholder="Masukkan password Anda"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p>
                Sudah punya akun? <a href="/login">Login</a>
              </p>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Daftar
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

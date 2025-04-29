import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/home");
    }
    signInGoogle();
  }, [navigate]);

  async function handlCredentialResponse(response) {
    console.log("Encoded JWT ID Token: " + response.credential);
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
    }
  }

  function signInGoogle() {
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handlCredentialResponse,
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

    if (!formData.email || !formData.password) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Email dan password harus diisi!",
      });
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
          <h2 className="text-center">Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
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
                name="password"
                placeholder="Masukkan password Anda"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p>
                Belum punya akun? <a href="/register">Register</a>
              </p>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Login
            </button>
            <div
              className="mt-2 text-center center container"
              id="buttonDiv"
            ></div>
          </form>
        </div>
      </div>
    </>
  );
}

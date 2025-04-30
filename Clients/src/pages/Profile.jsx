import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await phase2Api.get("/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setUser(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengambil data profil pengguna.",
        });
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    navigate("/edit-profile");
  };

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Akun Anda akan dihapus secara permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        await phase2Api.delete("/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Akun Anda telah dihapus.",
        });
        localStorage.removeItem("access_token");
        navigate("/login");
      } catch (error) {
        console.error("Error deleting account:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal menghapus akun.",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="spinner w-12 h-12 rounded-full border-4 border-t-[#6a64f1] animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <div className="inline-block p-4 rounded-full bg-[#6a64f1]/10 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-[#6a64f1]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-gray-700 mb-6">Data pengguna tidak ditemukan.</p>
          <button onClick={() => navigate("/home")} className="custom-button">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-[#6a64f1] mb-6">
            Profil Pengguna
          </h1>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
              <span className="w-32 font-medium text-gray-500">Nama</span>
              <span className="text-gray-800 font-medium">{user.name}</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center py-4 border-b border-gray-100">
              <span className="w-32 font-medium text-gray-500">Email</span>
              <span className="text-gray-800 font-medium">{user.email}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:gap-4 pt-6">
              <button onClick={handleDelete} className="danger-button">
                Hapus Akun
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-button {
          background-color: #6a64f1;
          border: none;
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
          text-align: center;
        }
        .custom-button:hover {
          background-color: #5a54d1;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(106, 100, 241, 0.3);
        }
        .danger-button {
          background-color: #ffffff;
          border: 1px solid #ef4444;
          color: #ef4444;
          padding: 0.5rem 1.25rem;
          border-radius: 0.375rem;
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: pointer;
          width: 100%;
          text-align: center;
        }
        .danger-button:hover {
          background-color: #ef4444;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @media (min-width: 640px) {
          .custom-button,
          .danger-button {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}

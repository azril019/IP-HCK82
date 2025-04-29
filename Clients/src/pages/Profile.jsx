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
        navigate("/register");
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
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Data pengguna tidak ditemukan.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profil Pengguna</h1>
      <div className="bg-white shadow-md rounded p-4">
        <p>
          <strong>Nama:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <div className="mt-4 flex space-x-4">
          <button onClick={handleDelete} className="btn btn-danger">
            Hapus Akun
          </button>
        </div>
      </div>
    </div>
  );
}

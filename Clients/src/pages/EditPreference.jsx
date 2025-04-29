import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";

export default function EditPreference() {
  const [formData, setFormData] = useState({
    user_id: "",
    location: "",
    job: "",
    degree: "",
    skill: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchPreference = async () => {
      try {
        // Fix: Get specific preference by ID from the endpoint
        const response = await phase2Api.get(`/preference`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        // Find the specific preference with the matching ID
        const preferenceData = response.data.find(
          (item) => item.id === Number(id)
        );

        if (preferenceData) {
          console.log("Found preference data:", preferenceData);
          setFormData(preferenceData);
        } else {
          console.error("Preference not found with ID:", id);
          Swal.fire({
            icon: "error",
            title: "Tidak Ditemukan",
            text: "Data preferensi tidak ditemukan.",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching preference:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal mengambil data preferensi.",
        });
        setLoading(false);
      }
    };

    fetchPreference();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await phase2Api.put(`/preference/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Preferensi berhasil diperbarui.",
      });
      navigate("/home/preference");
    } catch (error) {
      console.error("Error updating preference:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal memperbarui preferensi.",
      });
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Preference</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4">
        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="job"
            className="block text-sm font-medium text-gray-700"
          >
            Job
          </label>
          <input
            type="text"
            id="job"
            name="job"
            value={formData.job}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="degree"
            className="block text-sm font-medium text-gray-700"
          >
            Degree
          </label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="skill"
            className="block text-sm font-medium text-gray-700"
          >
            Skill
          </label>
          <input
            type="text"
            id="skill"
            name="skill"
            value={formData.skill}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  );
}

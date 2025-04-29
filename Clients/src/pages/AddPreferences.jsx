import { useState } from "react";
import { useNavigate } from "react-router";
import { phase2Api } from "../helpers/http-clients";
import Swal from "sweetalert2";

export default function AddPreference() {
  const jobCategory = [
    "Accounting",
    "Administrative",
    "Arts and Design",
    "Business Development",
    "Community and Social Services",
    "Consulting",
    "Education",
    "Engineering",
    "Entrepreneurship",
    "Finance",
    "Healthcare Services",
    "Human Resources",
    "Information Technology",
    "Legal",
    "Marketing",
    "Media and Communication",
    "Military and Protective Services",
    "Operations",
    "Product Management",
    "Program and Project Management",
    "Purchasing",
    "Quality Assurance",
    "Real Estate",
    "Research",
    "Sales",
    "Support",
    "Training",
    "Writing and Editing",
  ];
  const degrees = [
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctoral Degree",
    "Professional Degree",
    "High School Diploma",
    "Certificate",
    "Diploma",
    "Other",
  ];
  const [formData, setFormData] = useState({
    location: "",
    job: "",
    degree: "",
    skill: "",
  });
  const navigate = useNavigate();

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
      await phase2Api.post("/preference", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Preferensi berhasil ditambahkan.",
      });
      navigate("/home/preference");
    } catch (error) {
      console.error("Error adding preference:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal menambahkan preferensi.",
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tambah Preference</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded p-4">
        <div className="mb-4">
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            placeholder="Masukkan lokasi preferensi"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="job"
            className="block text-sm font-medium text-gray-700"
          >
            Job
          </label>
          <select
            id="job"
            name="job"
            value={formData.job}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Pilih kategori pekerjaan</option>
            {jobCategory.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="degree"
            className="block text-sm font-medium text-gray-700"
          >
            Degree
          </label>
          <select
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Pilih gelar pendidikan</option>
            {degrees.map((degree) => (
              <option key={degree} value={degree}>
                {degree}
              </option>
            ))}
          </select>
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
            placeholder="Masukkan keterampilan"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            Tambah Preferensi
          </button>
        </div>
      </form>
    </div>
  );
}
